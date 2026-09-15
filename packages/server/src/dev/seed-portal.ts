/**
 * Client-portal content seeder: a Secure Link channel with a live thread,
 * an Encrypted Account with known credentials, a one-time share link, a
 * custom intake form exercising the form-builder feature set, and intake
 * responses including one row whose key nobody holds.
 *
 * Sits alongside seed-tickets and seed-kb as content seeding. Structural
 * seeding (org, users, queues) is the caller's job and must already have
 * run: every step here attaches to an existing seeded ticket.
 *
 * Everything goes through the real portal services, so the crypto path is
 * the production one. Where the browser normally performs a step (the
 * client's own key derivation, field-content encryption under the
 * public-branding key), this module reproduces that step with the same
 * @care-y/crypto primitives rather than writing rows the product cannot
 * produce.
 */

import type { Kysely } from "kysely";

import {
  buildContentAad,
  decryptContent,
  deriveAccountKey,
  deriveChannelAuth,
  deriveChannelId,
  deriveClientAccountKeys,
  derivePortalKeypairFromOprf,
  eciesEncrypt,
  encode,
  encodeFileKeyPayload,
  encryptContent,
  encryptFieldContent,
  encryptFormMeta,
  fileKeySlot,
  filenameSlot,
  followupSlot,
  generateContentKey,
  generatePortalSeed,
  hashChannelAuth,
  oprfBlind,
  oprfFinalize,
  portalOprfInput,
  PORTAL_KEY_CHECK,
  requireSodium,
  sealForOrgKey,
  toCiphertext,
  toRistrettoPoint,
  toSalt,
  toSymmetricKey,
  type EciesOutput,
  type EncryptedFieldContent,
  type RistrettoPoint,
  type Salt,
  type SymmetricKey,
} from "@care-y/crypto";
import {
  buildIntakeFormResponse,
  channelSecretSchema,
  composeIntakeTicketContent,
  emailHashSchema,
  extractMessageText,
  intakeFormIdSchema,
  newClientAccountId,
  newFollowupId,
  newKeyGeneration,
  newShareId,
  newTicketId,
  type ClientAccountId,
  type ClientId,
  type FollowupId,
  type IntakeFieldConfig,
  type IntakeFieldRole,
  type IntakeFieldType,
  type IntakeFormId,
  type IntakeFormResponse,
  type LocalizedText,
  type OrgId,
  type OrgSchema,
  type OrgSlug,
  type QueueId,
  replyTokenHashSchema,
  type ShareId,
  type TicketId,
  type UserId,
  type VisibleWhenV2,
} from "@care-y/shared";

import { InternalError } from "../errors.js";
import type { TenantDatabase } from "../db/types.js";
import type {
  FieldEncryptor,
  BlindIndexer,
} from "../crypto/field-encryptor.js";
import type { SealedBoxEncryptor } from "../crypto/sealed-box.js";
import { channelTag, accountTag } from "../crypto/oprf-tags.js";
import type { NotificationService } from "../notifications/service.js";
import type { BlobStore } from "../storage/store.js";
import type { AccountServiceDeps } from "../portal/account-service.js";
import * as accountService from "../portal/account-service.js";
import { createChannel } from "../portal/channel-service.js";
import { createShare } from "../portal/share-service.js";
import { createIntakeTicket } from "../portal/intake-service.js";
import type { IntakeFormService } from "../portal/intake-form-service.js";
import { insertClientWrap } from "../portal/portal-attachment-service.js";
import { insertClientRecordingWrap } from "../portal/portal-recording-service.js";
import {
  clientReply,
  storeClientCopy,
  type PortalMessageServiceDeps,
} from "../portal/portal-message-service.js";
import type { PortalChannelRow } from "../portal/channel-service.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** AAD slot for the structured intake response blob. */
const FORM_RESPONSE_SLOT = "intake-form-response";

const textEncoder = new TextEncoder();

// ---------------------------------------------------------------------------
// Input / output types
// ---------------------------------------------------------------------------

export interface SeedPortalDeps {
  readonly tDb: Kysely<TenantDatabase>;
  readonly sealedBox: SealedBoxEncryptor;
  /** The org's Curve25519 public key. Seals ticket keys and derives the public-branding key. */
  readonly orgPublicKey: Uint8Array;
  readonly fieldEncryptor: FieldEncryptor;
  readonly blobStore: BlobStore;
  readonly intakeFormService: IntakeFormService;
  readonly notificationService: NotificationService;
  /** Account service deps minus orgUuid, which this module fills from orgId. */
  readonly accountServiceDeps: Omit<AccountServiceDeps, "orgUuid">;
  readonly orgId: OrgId;
  readonly orgSchema: OrgSchema;
  readonly orgSlug: OrgSlug;
  /** Volunteer who authors the outbound portal message and the share link. */
  readonly adminUserId: UserId;
  /**
   * Seeded ticket the Secure Link channel and the share link attach to.
   * Use the ticket the narration deep-links into, so the portal tier and
   * share status render on a page the story already visits.
   */
  readonly anchorTicketId: TicketId;
  /**
   * Content key of the anchor ticket, handed over by the seeder that
   * minted it. Nothing on a running server can recover this: the org wrap
   * opens only with the org secret key, which lives on the client. The
   * outbound portal message and the share follow-up both need it, because
   * both are ticket content.
   */
  readonly anchorTicketKey: SymmetricKey;
  /**
   * Evaluate a blinded ristretto255 point through the org's OPRF, standing
   * in for the two-server hop the browser makes. Returns the evaluated
   * point. The tag selects the per-identity working share (ADR-091); the
   * account's keys are only reproducible at login if this evaluates under
   * the same tagged scalar the running server uses.
   */
  readonly evaluateOprf: (
    blindedElement: Uint8Array,
    tag: string,
  ) => Uint8Array;
  /** Blind indexer for deterministic email hash (same derivation as email-service). */
  readonly blindIndexer: BlindIndexer;
  /** Credentials the demo publishes for the seeded account. */
  readonly accountUsername: string;
  readonly accountPassword: string;
}

export interface SeedPortalResult {
  /** Channel id for /portal/[channelId]. */
  readonly portalChannelId: string;
  /** Base64url portal seed for the URL fragment. Never leaves the address bar. */
  readonly portalFragment: string;
  /** Share id for /share/[id]. */
  readonly shareId: ShareId;
  /** Base64url symmetric key for the share URL fragment. */
  readonly shareFragment: string;
  readonly accountId: ClientAccountId;
  readonly accountUsername: string;
  readonly accountPassword: string;
  /** Custom form exercising the builder feature set. */
  readonly customFormId: IntakeFormId;
  /** Public slug of the custom form, for /(client)/intake/[slug]. */
  readonly customFormSlug: string;
  /** Sibling form whose closes_at has passed. */
  readonly closedFormId: IntakeFormId;
  /** Tickets created by the seeded intake submissions, newest last. */
  readonly responseTicketIds: readonly TicketId[];
  /** The response whose key wrap was removed, so the viewer's denied state has an example. */
  readonly keyNotHeldTicketId: TicketId;
}

// ---------------------------------------------------------------------------
// Field content encryption (browser-side in production)
// ---------------------------------------------------------------------------

interface SeedField {
  readonly fieldKey: string;
  readonly fieldType: IntakeFieldType;
  readonly label: LocalizedText;
  readonly config: IntakeFieldConfig;
  readonly isRequired: boolean;
  readonly role?: IntakeFieldRole | null;
  readonly routingQueueIds?: readonly QueueId[] | null;
  readonly visibleWhen?: VisibleWhenV2;
}

/** A single seeded answer, in the shape the submit path consumes. */
interface SeedAnswer {
  readonly fieldKey: string;
  readonly fieldType: IntakeFieldType;
  readonly label: string;
  readonly value: string | string[] | boolean;
}

/**
 * Adapt a SeedField to the shape the shared encryptor takes.
 *
 * The encryption itself now lives in @care-y/crypto beside the branding
 * pair, with the AAD private inside it, so this seeder is no longer a
 * second place those bytes are written down.
 */
function encryptSeedField(
  field: SeedField,
  orgPublicKey: Uint8Array,
): EncryptedFieldContent {
  return encryptFieldContent(
    {
      label: field.label,
      config: field.config,
      visibleWhen: field.visibleWhen,
    },
    orgPublicKey,
  );
}

// ---------------------------------------------------------------------------
// Form definitions
// ---------------------------------------------------------------------------

/**
 * The custom form. Covers what the builder can express: both locales on
 * every string, a rich-text block, help text, a page break, a select that
 * routes to a queue, a select that sets priority, and two fields gated on
 * a grouped visibility condition.
 */
function buildCustomFormFields(routingQueueIds: readonly QueueId[]): {
  fields: readonly SeedField[];
  queueOptionKeys: readonly string[];
} {
  const housingQueue = routingQueueIds[0];
  const crisisQueue = routingQueueIds[1] ?? routingQueueIds[0];
  if (housingQueue === undefined || crisisQueue === undefined) {
    throw new InternalError("seedPortal needs at least one queue to route to");
  }

  const topicHousing = "opt-topic-housing";
  const topicCrisis = "opt-topic-crisis";

  const fields: SeedField[] = [
    {
      fieldKey: "intro-block",
      fieldType: "richText",
      label: { en: "Before you start", es: "Antes de empezar" },
      isRequired: false,
      config: {
        type: "richText",
        body: {
          en: {
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Answer only what you feel safe answering. Every field on this page is optional unless it is marked required, and nothing you type is readable by anyone outside the team that answers this form.",
                  },
                ],
              },
            ],
          },
          es: {
            type: "doc",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Responda solo lo que le resulte seguro responder. Todos los campos de esta pagina son opcionales salvo los marcados como obligatorios, y nadie fuera del equipo que atiende este formulario puede leer lo que escriba.",
                  },
                ],
              },
            ],
          },
        },
      },
    },
    {
      fieldKey: "preferred-name",
      fieldType: "text",
      label: { en: "What should we call you?", es: "Como le llamamos?" },
      isRequired: false,
      role: "real-name",
      config: {
        type: "text",
        maxLength: 80,
        placeholder: { en: "Any name works", es: "Cualquier nombre sirve" },
        helpText: {
          en: "A nickname is fine. We never ask for a legal name.",
          es: "Un apodo esta bien. Nunca pedimos un nombre legal.",
        },
      },
    },
    {
      fieldKey: "topic",
      fieldType: "select",
      label: {
        en: "What brings you here today?",
        es: "Que le trae aqui hoy?",
      },
      isRequired: true,
      role: "queue-routing",
      routingQueueIds: [housingQueue, crisisQueue],
      config: {
        type: "select",
        options: [
          {
            key: topicHousing,
            label: { en: "Somewhere to stay", es: "Un lugar donde quedarse" },
          },
          {
            key: topicCrisis,
            label: {
              en: "I am in immediate danger",
              es: "Estoy en peligro inmediato",
            },
          },
        ],
        helpText: {
          en: "This decides who reads your answers first.",
          es: "Esto decide quien lee sus respuestas primero.",
        },
        queueRoutingMapping: {
          [topicHousing]: housingQueue,
          [topicCrisis]: crisisQueue,
        },
      },
    },
    {
      fieldKey: "page-break-details",
      fieldType: "pageBreak",
      label: { en: "Your situation", es: "Su situacion" },
      isRequired: false,
      config: {
        type: "pageBreak",
        title: { en: "Your situation", es: "Su situacion" },
      },
    },
    {
      fieldKey: "situation",
      fieldType: "textarea",
      label: {
        en: "Tell us what is going on",
        es: "Cuentenos que esta pasando",
      },
      isRequired: true,
      config: {
        type: "textarea",
        maxLength: 4_000,
        helpText: {
          en: "As much or as little as you want. This becomes the first message in your case.",
          es: "Tanto o tan poco como quiera. Esto se convierte en el primer mensaje de su caso.",
        },
      },
    },
    {
      fieldKey: "urgency",
      fieldType: "select",
      label: {
        en: "How soon do you need an answer?",
        es: "Que tan pronto necesita una respuesta?",
      },
      isRequired: false,
      role: "urgency",
      config: {
        type: "select",
        options: [
          {
            key: "opt-urgency-days",
            label: { en: "Within a few days", es: "En unos dias" },
          },
          {
            key: "opt-urgency-today",
            label: { en: "Today if possible", es: "Hoy si es posible" },
          },
        ],
        urgencyMapping: {
          "opt-urgency-days": "normal",
          "opt-urgency-today": "high",
        },
      },
    },
    {
      fieldKey: "text-ok",
      fieldType: "checkbox",
      label: {
        en: "It is safe to text this number",
        es: "Es seguro enviar mensajes a este numero",
      },
      isRequired: false,
      config: {
        type: "checkbox",
        helpText: {
          en: "Leave this unchecked if someone else can see your messages.",
          es: "Deje esto sin marcar si otra persona puede ver sus mensajes.",
        },
      },
    },
    {
      // Two fields deep on the same answer: the phone number only appears
      // once the visitor says a text is safe to receive.
      fieldKey: "phone",
      fieldType: "text",
      label: { en: "Phone number", es: "Numero de telefono" },
      isRequired: false,
      role: "phone-contact",
      visibleWhen: {
        version: 2,
        groups: [
          [{ fieldKey: "text-ok", operator: "checked", boolValue: true }],
        ],
      },
      config: {
        type: "text",
        subtype: "phone",
        maxLength: 20,
      },
    },
    {
      fieldKey: "quiet-hours",
      fieldType: "text",
      label: {
        en: "Hours when a text would not be safe",
        es: "Horas en las que un mensaje no seria seguro",
      },
      isRequired: false,
      role: "contact-safety",
      visibleWhen: {
        version: 2,
        groups: [
          [
            { fieldKey: "text-ok", operator: "checked", boolValue: true },
            { fieldKey: "phone", operator: "isNotEmpty" },
          ],
        ],
      },
      config: {
        type: "text",
        maxLength: 120,
        placeholder: {
          en: "For example, 9am to 5pm",
          es: "Por ejemplo, 9am a 5pm",
        },
      },
    },
  ];

  return { fields, queueOptionKeys: [topicHousing, topicCrisis] };
}

/** The sibling form, identical in shape but past its closing date. */
function buildClosedFormFields(): readonly SeedField[] {
  return [
    {
      fieldKey: "winter-notice",
      fieldType: "richText",
      label: { en: "This form has closed", es: "Este formulario ya cerro" },
      isRequired: false,
      config: {
        type: "richText",
        body: {
          en: "The winter shelter intake ran from November through March. The main intake form is still open.",
          es: "La admision al refugio de invierno estuvo abierta de noviembre a marzo. El formulario principal sigue abierto.",
        },
      },
    },
    {
      fieldKey: "winter-name",
      fieldType: "text",
      label: { en: "What should we call you?", es: "Como le llamamos?" },
      isRequired: false,
      role: "real-name",
      config: { type: "text", maxLength: 80 },
    },
  ];
}

// ---------------------------------------------------------------------------
// Seed steps
// ---------------------------------------------------------------------------

/** Resolve the client behind a ticket. */
async function resolveTicketClient(
  tDb: Kysely<TenantDatabase>,
  ticketId: TicketId,
): Promise<ClientId> {
  const row = await tDb
    .selectFrom("tickets")
    .select("client_id")
    .where("id", "=", ticketId)
    .executeTakeFirst();
  if (!row) {
    throw new InternalError(`seedPortal anchor ticket ${ticketId} not found`);
  }
  return row.client_id;
}

/**
 * Set up the Secure Link tier. Mints a portal seed, registers the channel
 * against it, and gives the channel a thread with one message each way.
 * Returns the fragment the URL carries, which is the only place the seed
 * exists in production.
 */
async function seedSecureLink(
  deps: SeedPortalDeps,
  clientId: ClientId,
): Promise<{ channelId: string; fragment: string; channel: PortalChannelRow }> {
  const { tDb, orgPublicKey, adminUserId, anchorTicketId } = deps;

  const sodium = requireSodium();
  const seed = generatePortalSeed();
  const channelId = deriveChannelId(seed);
  const auth = deriveChannelAuth(seed);

  // ADR-091: derive the keypair through the same OPRF round the browser
  // performs. The channel tag is available because deriveChannelId runs
  // before the round.
  const oprfInput = portalOprfInput(seed);
  const { blindedElement, blindState } = oprfBlind(oprfInput);
  const tag = channelTag(deps.orgId, channelSecretSchema.parse(channelId));
  const evaluated = deps.evaluateOprf(blindedElement, tag);
  const oprfOutput = oprfFinalize(
    blindState,
    toRistrettoPoint(evaluated),
    oprfInput,
  );
  const keypair = derivePortalKeypairFromOprf(oprfOutput);
  sodium.memzero(oprfInput);
  sodium.memzero(oprfOutput);

  const keyCheck = eciesEncrypt(
    textEncoder.encode(PORTAL_KEY_CHECK),
    keypair.clientPublic,
  );

  await createChannel(tDb, clientId, {
    channelId: channelSecretSchema.parse(channelId),
    authHash: Buffer.from(hashChannelAuth(auth)),
    clientPublic: Buffer.from(keypair.clientPublic),
    hasPassphrase: false,
    keyCheck: {
      ephemeralPoint: Buffer.from(keyCheck.ephemeralPoint),
      nonce: Buffer.from(keyCheck.nonce),
      ciphertext: Buffer.from(keyCheck.ciphertext),
    },
  });

  const channel = await tDb
    .selectFrom("portal_channels")
    .selectAll()
    .where("channel_id", "=", channelSecretSchema.parse(channelId))
    .executeTakeFirstOrThrow();

  // Outbound: a volunteer message with its client copy, the pair the
  // follow-up service writes when a ticket has an active channel.
  const outboundId = newFollowupId();
  const outboundText =
    "We have a bed held for tonight and someone can meet you at the door. Reply here if the timing does not work.";
  await insertVolunteerPortalMessage(deps, {
    channel,
    ticketId: anchorTicketId,
    followUpId: outboundId,
    text: outboundText,
    authorId: adminUserId,
    clientPublic: keypair.clientPublic,
  });

  // Inbound: the real client reply path, which also writes the sealed
  // tk_temp the volunteer side later converges.
  await clientReply(tDb, portalMessageDeps(deps), channel, {
    ticketId: anchorTicketId,
    keyGeneration: newKeyGeneration(),
    ...encryptClientMessage(
      "Tonight works. I can be there after eight.",
      orgPublicKey,
      keypair.clientPublic,
      anchorTicketId,
    ),
  });

  sodium.memzero(keypair.clientPrivate);
  return { channelId, fragment: encode(seed), channel };
}

/**
 * Encrypt a client-authored portal message the way the portal composer
 * does: content under a fresh tk_temp sealed to the org key, plus an ECIES
 * self copy so the sender can still read it.
 */
function encryptClientMessage(
  text: string,
  orgPublicKey: Uint8Array,
  clientPublic: RistrettoPoint,
  ticketId: TicketId,
): {
  encryptedContent: Buffer;
  wrappedTkTemp: Buffer;
  selfCopy: {
    ephemeralPoint: Buffer;
    nonce: Buffer;
    ciphertext: Buffer;
  };
  followUpId: FollowupId;
} {
  const followUpId = newFollowupId();
  const tkTemp: SymmetricKey = generateContentKey();
  try {
    const aad = buildContentAad(ticketId, followupSlot(followUpId));
    const encrypted = encryptContent(textEncoder.encode(text), tkTemp, aad);
    const wrapped = sealForOrgKey(tkTemp, orgPublicKey);
    const selfCopy: EciesOutput = eciesEncrypt(
      textEncoder.encode(text),
      clientPublic,
    );
    return {
      followUpId,
      encryptedContent: Buffer.from(encrypted),
      wrappedTkTemp: Buffer.from(wrapped),
      selfCopy: {
        ephemeralPoint: Buffer.from(selfCopy.ephemeralPoint),
        nonce: Buffer.from(selfCopy.nonce),
        ciphertext: Buffer.from(selfCopy.ciphertext),
      },
    };
  } finally {
    requireSodium().memzero(tkTemp);
  }
}

/**
 * Volunteer-authored message plus its portal copy. Written directly rather
 * than through the follow-up service, which would need a ticket access
 * checker and a notification fan-out for two rows; storeClientCopy is the
 * same function that service calls for the copy half.
 */
async function insertVolunteerPortalMessage(
  deps: SeedPortalDeps,
  args: {
    channel: PortalChannelRow;
    ticketId: TicketId;
    followUpId: FollowupId;
    text: string;
    authorId: UserId;
    clientPublic: RistrettoPoint;
  },
): Promise<void> {
  const { tDb, anchorTicketKey } = deps;
  const aad = buildContentAad(args.ticketId, followupSlot(args.followUpId));
  const encrypted = encryptContent(
    textEncoder.encode(args.text),
    anchorTicketKey,
    aad,
  );
  const copy = eciesEncrypt(textEncoder.encode(args.text), args.clientPublic);

  await tDb.transaction().execute(async (trx) => {
    await trx
      .insertInto("followups")
      .values({
        id: args.followUpId,
        ticket_id: args.ticketId,
        source: "volunteer",
        type: "message",
        encrypted_content: Buffer.from(encrypted),
        created_by: args.authorId,
        key_generation: null,
      })
      .execute();

    await storeClientCopy(
      trx,
      args.channel.id,
      args.followUpId,
      {
        ephemeralPoint: Buffer.from(copy.ephemeralPoint),
        nonce: Buffer.from(copy.nonce),
        ciphertext: Buffer.from(copy.ciphertext),
      },
      "to_client",
    );
  });
}

/**
 * Encrypted Account: run the browser's registration pipeline against the
 * org's OPRF so the published password re-derives the same keys at login.
 */
async function seedAccount(
  deps: SeedPortalDeps,
  clientId: ClientId,
): Promise<ClientAccountId> {
  const sodium = requireSodium();
  const accountId = newClientAccountId();
  const salt: Salt = toSalt(sodium.randombytes_buf(16));

  const stretched = deriveAccountKey(
    textEncoder.encode(deps.accountPassword),
    salt,
  );
  const { blindedElement, blindState } = oprfBlind(stretched);
  const evaluated = deps.evaluateOprf(blindedElement, accountTag(accountId));
  const oprfOutput = oprfFinalize(
    blindState,
    toRistrettoPoint(evaluated),
    stretched,
  );
  const keys = deriveClientAccountKeys(oprfOutput);

  try {
    const keyCheck = eciesEncrypt(
      textEncoder.encode(PORTAL_KEY_CHECK),
      keys.keypair.clientPublic,
    );

    await accountService.createAccount(
      deps.tDb,
      { ...deps.accountServiceDeps, orgUuid: deps.orgId },
      clientId,
      {
        accountId,
        username: deps.accountUsername,
        salt: Buffer.from(salt),
        publicKey: Buffer.from(keys.keypair.clientPublic),
        authHash: Buffer.from(hashChannelAuth(keys.authToken)),
        keyCheck: {
          ephemeralPoint: Buffer.from(keyCheck.ephemeralPoint),
          nonce: Buffer.from(keyCheck.nonce),
          ciphertext: Buffer.from(keyCheck.ciphertext),
        },
      },
    );
  } finally {
    sodium.memzero(stretched);
    sodium.memzero(oprfOutput);
    sodium.memzero(keys.authToken);
    sodium.memzero(keys.keypair.clientPrivate);
  }

  return accountId;
}

/** One-time share link, encrypted under a key that only the fragment carries. */
async function seedShareLink(
  deps: SeedPortalDeps,
): Promise<{ shareId: ShareId; fragment: string }> {
  const shareId = newShareId();
  const text =
    "Intake summary for the shelter coordinator: bed needed tonight, arriving after eight, no follow-up contact by phone.";

  const key: SymmetricKey = generateContentKey();
  let ciphertext: Buffer;
  let fragment: string;
  try {
    ciphertext = Buffer.from(
      encryptContent(
        textEncoder.encode(text),
        key,
        buildContentAad(shareId, "share-content"),
      ),
    );
    // Encode before zeroing: once the key bytes are gone the fragment is
    // the only copy left, exactly as it is after the compose sheet closes.
    fragment = encode(key);
  } finally {
    requireSodium().memzero(key);
  }

  // The follow-up copy keeps the case record complete after the link
  // expires, so it rides the ticket key rather than the share key.
  const followUpId = newFollowupId();
  const encryptedFollowUp = Buffer.from(
    encryptContent(
      textEncoder.encode(text),
      deps.anchorTicketKey,
      buildContentAad(deps.anchorTicketId, followupSlot(followUpId)),
    ),
  );

  await createShare(deps.tDb, {
    shareId,
    ticketId: deps.anchorTicketId,
    ciphertext,
    followUpId,
    encryptedFollowUp,
    createdBy: deps.adminUserId,
  });

  return { shareId, fragment };
}

/**
 * Seal the anchor ticket's media to the portal channel.
 *
 * seedTestTickets writes recordings and attachments with the file-key
 * envelope on the anchor ticket: each blob is encrypted under a random
 * file key, and that key is wrapped under the ticket key in
 * `file_key_wrap`. No channel existed at that point, so the client
 * half was deferred.
 *
 * This function closes the loop: for every recording and attachment on
 * the anchor ticket that carries a file_key_wrap, it unwraps the file
 * key using the ticket key, seals it to the channel's client_public,
 * and inserts the portal carrier row (portal_recordings /
 * portal_attachments). Call entries (phone_call follow-ups) need
 * nothing: the portal-message-service joins them from the followups
 * table, scoped to the channel's client_id.
 */
async function sealAnchorTicketMedia(
  deps: SeedPortalDeps,
  channel: PortalChannelRow,
): Promise<void> {
  const { tDb, anchorTicketId, anchorTicketKey } = deps;
  const sodium = requireSodium();
  const clientPublic = toRistrettoPoint(new Uint8Array(channel.client_public));

  // Recordings with file_key_wrap on the anchor ticket
  const recordings = await tDb
    .selectFrom("recordings")
    .select(["id", "followup_id", "file_key_wrap"])
    .where("ticket_id", "=", anchorTicketId)
    .where("file_key_wrap", "is not", null)
    .where("deleted_at", "is", null)
    .execute();

  for (const rec of recordings) {
    if (rec.file_key_wrap === null || rec.followup_id === null) continue;

    const fileKey = toSymmetricKey(
      decryptContent(
        toCiphertext(new Uint8Array(rec.file_key_wrap)),
        anchorTicketKey,
        buildContentAad(anchorTicketId, fileKeySlot(rec.id)),
      ),
    );
    try {
      const payload = encodeFileKeyPayload(fileKey, "");
      const sealed = eciesEncrypt(payload, clientPublic);

      const fu = await tDb
        .selectFrom("followups")
        .select(["source", "created_at"])
        .where("id", "=", rec.followup_id)
        .executeTakeFirstOrThrow();
      const direction: "from_client" | "to_client" =
        fu.source === "client" ? "from_client" : "to_client";

      await insertClientRecordingWrap(tDb, {
        recordingId: rec.id,
        channelRowId: channel.id,
        followupId: rec.followup_id,
        direction,
        copy: {
          ephemeralPoint: Buffer.from(sealed.ephemeralPoint),
          nonce: Buffer.from(sealed.nonce),
          ciphertext: Buffer.from(sealed.ciphertext),
        },
      });
    } finally {
      sodium.memzero(fileKey);
    }
  }

  // Attachments with file_key_wrap on the anchor ticket
  const attachments = await tDb
    .selectFrom("attachments")
    .select(["id", "followup_id", "file_key_wrap", "encrypted_filename"])
    .where("ticket_id", "=", anchorTicketId)
    .where("file_key_wrap", "is not", null)
    .where("deleted_at", "is", null)
    .execute();

  for (const att of attachments) {
    if (att.file_key_wrap === null || att.followup_id === null) continue;

    const fileKey = toSymmetricKey(
      decryptContent(
        toCiphertext(new Uint8Array(att.file_key_wrap)),
        anchorTicketKey,
        buildContentAad(anchorTicketId, fileKeySlot(att.id)),
      ),
    );
    try {
      // Recover the plaintext filename from the encrypted_filename column
      // so the client copy carries it. When null (client MMS), the payload
      // carries an empty string, matching the production ingest path.
      let filename = "";
      if (att.encrypted_filename !== null) {
        const fnBytes = decryptContent(
          toCiphertext(new Uint8Array(att.encrypted_filename)),
          anchorTicketKey,
          buildContentAad(anchorTicketId, filenameSlot(att.id)),
        );
        filename = new TextDecoder().decode(fnBytes);
      }

      const payload = encodeFileKeyPayload(fileKey, filename);
      const sealed = eciesEncrypt(payload, clientPublic);

      const fu = await tDb
        .selectFrom("followups")
        .select(["source", "created_at"])
        .where("id", "=", att.followup_id)
        .executeTakeFirstOrThrow();
      const direction: "from_client" | "to_client" =
        fu.source === "client" ? "from_client" : "to_client";

      await insertClientWrap(tDb, {
        attachmentId: att.id,
        channelRowId: channel.id,
        followupId: att.followup_id,
        direction,
        copy: {
          ephemeralPoint: Buffer.from(sealed.ephemeralPoint),
          nonce: Buffer.from(sealed.nonce),
          ciphertext: Buffer.from(sealed.ciphertext),
        },
      });
    } finally {
      sodium.memzero(fileKey);
    }
  }
}

/**
 * Eligible followup types for portal message copies, matching the
 * production rule in reseed-service.ts (MESSAGE_COPY_TYPES):
 * message, sms_outbound, sms_inbound, email_outbound, email_inbound.
 */
const MESSAGE_COPY_TYPES = new Set([
  "message",
  "sms_outbound",
  "sms_inbound",
  "email_outbound",
  "email_inbound",
]);

/**
 * Mirror the anchor ticket's text-bearing follow-ups as portal messages.
 *
 * The Secure Link seeder already writes two purpose-made messages. The
 * anchor ticket's thread has many more, and the standing parity rule
 * (ADR-087) says both surfaces show the same conversation. This function
 * reads every eligible follow-up on the anchor ticket, decrypts under
 * the ticket key, seals to the channel's client_public, and inserts via
 * storeClientCopy.
 *
 * Eligibility mirrors the production reseed-service: only types in
 * MESSAGE_COPY_TYPES, excluding private and deleted rows.
 *
 * Rows the channel already carries are excluded rather than left to
 * onConflictIgnore, because the skip has to happen before the decrypt, not
 * at the insert. The client's own reply is the case that forces this: its
 * content is sealed under the per-reply tk_temp held in
 * portal_reply_key_wraps until convergence, so decrypting it under the
 * ticket key throws, and it already has its own portal_messages row from
 * clientReply. Mirroring only what is not already mirrored avoids both.
 */
async function sealAnchorTicketMessages(
  deps: SeedPortalDeps,
  channel: PortalChannelRow,
): Promise<void> {
  const { tDb, anchorTicketId, anchorTicketKey } = deps;
  const sodium = requireSodium();
  const clientPublic = toRistrettoPoint(new Uint8Array(channel.client_public));

  const followups = await tDb
    .selectFrom("followups")
    .select(["id", "source", "type", "encrypted_content", "created_at"])
    .where("ticket_id", "=", anchorTicketId)
    .where("is_private", "=", false)
    .where("deleted_at", "is", null)
    .where("type", "in", [...MESSAGE_COPY_TYPES])
    // System events carry no encrypted content under the Proton model
    // (seed-tickets writes a zero-length buffer), and an absent type
    // defaults to "message", so they reach the eligible set with nothing
    // to decrypt. They are org chrome rather than conversation either way.
    .where("source", "!=", "system")
    .where((eb) =>
      eb.not(
        eb.exists(
          eb
            .selectFrom("portal_messages")
            .select("portal_messages.id")
            .where("portal_messages.channel_id", "=", channel.id)
            .whereRef("portal_messages.followup_id", "=", "followups.id"),
        ),
      ),
    )
    .orderBy("created_at", "asc")
    .execute();

  for (const fu of followups) {
    // Belt and braces: any other zero-length row is skipped rather than
    // failing the whole seed on one undecryptable follow-up.
    if (fu.encrypted_content.length === 0) continue;

    const aad = buildContentAad(anchorTicketId, followupSlot(fu.id));
    const plaintext = Buffer.from(
      decryptContent(
        toCiphertext(new Uint8Array(fu.encrypted_content)),
        anchorTicketKey,
        aad,
      ),
    );
    try {
      const sealed = eciesEncrypt(plaintext, clientPublic);
      const direction: "from_client" | "to_client" =
        fu.source === "client" ? "from_client" : "to_client";

      await storeClientCopy(
        tDb,
        channel.id,
        fu.id,
        {
          ephemeralPoint: Buffer.from(sealed.ephemeralPoint),
          nonce: Buffer.from(sealed.nonce),
          ciphertext: Buffer.from(sealed.ciphertext),
        },
        direction,
        {
          createdAt: fu.created_at,
          onConflictIgnore: true,
        },
      );
    } finally {
      sodium.memzero(plaintext);
    }
  }
}

/** Save both intake forms and return their ids. */
async function seedForms(
  deps: SeedPortalDeps,
  routingQueueIds: readonly QueueId[],
): Promise<{
  customFormId: IntakeFormId;
  customFormSlug: string;
  closedFormId: IntakeFormId;
  fields: readonly SeedField[];
  queueOptionKeys: readonly string[];
}> {
  const { fields, queueOptionKeys } = buildCustomFormFields(routingQueueIds);

  const customSlug = "ask-for-help";
  const custom = await deps.intakeFormService.saveForm(
    deps.tDb,
    deps.adminUserId,
    {
      formId: null,
      name: "Ask for help",
      slug: customSlug,
      isDefault: false,
      destinationQueueId: routingQueueIds[0] ?? null,
      encryptedFormMeta: encryptFormMeta(
        {
          description: {
            en: "Nothing here is stored in the clear, and you can stop at any point.",
            es: "Nada de esto se guarda sin cifrar, y puede detenerse en cualquier momento.",
          },
          submitMessage: {
            en: "Your answers are on their way to someone who can help. Nobody outside the team can read them.",
            es: "Sus respuestas van camino a alguien que puede ayudar. Nadie fuera del equipo puede leerlas.",
          },
        },
        deps.orgPublicKey,
      ),
      fields: fields.map((f) => ({
        fieldKey: f.fieldKey,
        fieldType: f.fieldType,
        isRequired: f.isRequired,
        role: f.role ?? null,
        routingQueueIds:
          f.routingQueueIds != null ? [...f.routingQueueIds] : null,
        escalationRecipientIds: null,
        ...encryptSeedField(f, deps.orgPublicKey),
      })),
    },
  );

  const closedFields = buildClosedFormFields();
  const closed = await deps.intakeFormService.saveForm(
    deps.tDb,
    deps.adminUserId,
    {
      formId: null,
      name: "Winter shelter intake",
      slug: "winter-shelter",
      isDefault: false,
      destinationQueueId: routingQueueIds[0] ?? null,
      closesAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      // closedMessage is the whole point of this form: it is what a
      // visitor arriving on a stale link actually sees.
      encryptedFormMeta: encryptFormMeta(
        {
          description: {
            en: "Winter shelter intake ran from November through March.",
            es: "La admision al refugio de invierno estuvo abierta de noviembre a marzo.",
          },
          closedMessage: {
            en: "This form has closed for the season. The main intake form is still open, and the phone line answers year round.",
            es: "Este formulario cerro por la temporada. El formulario principal sigue abierto y la linea telefonica atiende todo el ano.",
          },
        },
        deps.orgPublicKey,
      ),
      fields: closedFields.map((f) => ({
        fieldKey: f.fieldKey,
        fieldType: f.fieldType,
        isRequired: f.isRequired,
        role: f.role ?? null,
        routingQueueIds: null,
        escalationRecipientIds: null,
        ...encryptSeedField(f, deps.orgPublicKey),
      })),
    },
  );

  const customFormId = intakeFormIdSchema.parse(custom.formId);
  const closedFormId = intakeFormIdSchema.parse(closed.formId);

  // saveForm creates a draft: intake_forms.is_active defaults to false and
  // publishing is a separate admin action. Both forms need it, including
  // the closed one, because the public resolver filters on is_active
  // before it ever looks at closes_at.
  await deps.intakeFormService.setActive(deps.tDb, customFormId, true);
  await deps.intakeFormService.setActive(deps.tDb, closedFormId, true);

  return {
    customFormId,
    customFormSlug: customSlug,
    closedFormId,
    fields,
    queueOptionKeys,
  };
}

/** One submission through the real intake path. */
async function submitSeedResponse(
  deps: SeedPortalDeps,
  formId: IntakeFormId,
  answers: readonly SeedAnswer[],
  routing: {
    resolvedQueueId: QueueId | null;
    resolvedPriority: "low" | "normal" | "high" | "urgent" | null;
  },
): Promise<TicketId> {
  const ticketId = newTicketId();
  const followUpId = newFollowupId();
  const tk: SymmetricKey = generateContentKey();

  try {
    // Composition is the product's, not this seeder's. It shapes the
    // title, the description lines and the structured payload exactly as
    // a real web intake does, so a volunteer reading a seeded ticket
    // sees the format the product produces.
    //
    // One visible consequence, and it is the correct one: the title
    // carries a name only for a "default:name" answer, which the built-in
    // form supplies and this custom form does not. Seeded tickets from
    // the custom form therefore read "Web intake" with no name, which is
    // what real intake through that form would produce. The earlier copy
    // here keyed off "preferred-name" and produced a title the product
    // never would.
    const { title, description } = composeIntakeTicketContent(answers);
    const messageText = extractMessageText(answers);
    const responsePayload: IntakeFormResponse = buildIntakeFormResponse(
      formId,
      answers,
    );

    const encryptedMessage =
      messageText !== null
        ? Buffer.from(
            encryptContent(
              textEncoder.encode(messageText),
              tk,
              buildContentAad(ticketId, followupSlot(followUpId)),
            ),
          )
        : null;

    await createIntakeTicket(
      deps.tDb,
      {
        // No notificationService: createIntakeTicket writes its notification
        // intent to the outbox inside its own transaction and the drainer
        // dispatches from there, so the caller supplies no dispatcher.
        sealedBox: deps.sealedBox,
        orgId: deps.orgId,
        orgSchema: deps.orgSchema,
        orgSlug: deps.orgSlug,
      },
      {
        ticketId,
        followUpId: encryptedMessage !== null ? followUpId : null,
        encryptedTitle: Buffer.from(
          encryptContent(
            textEncoder.encode(title),
            tk,
            buildContentAad(ticketId, "title"),
          ),
        ),
        encryptedDescription: Buffer.from(
          encryptContent(
            textEncoder.encode(description),
            tk,
            buildContentAad(ticketId, "description"),
          ),
        ),
        encryptedMessage,
        encryptedFormResponse: Buffer.from(
          encryptContent(
            textEncoder.encode(JSON.stringify(responsePayload)),
            tk,
            buildContentAad(ticketId, FORM_RESPONSE_SLOT),
          ),
        ),
        formId,
        wrappedTk: Buffer.from(sealForOrgKey(tk, deps.orgPublicKey)),
        resolvedQueueId: routing.resolvedQueueId,
        resolvedPriority: routing.resolvedPriority,
        resolvedEscalationLevel: null,
        account: null,
        continuation: null,
      },
    );
  } finally {
    requireSodium().memzero(tk);
  }

  return ticketId;
}

// ---------------------------------------------------------------------------
// Shared dep shaping
// ---------------------------------------------------------------------------

function portalMessageDeps(deps: SeedPortalDeps): PortalMessageServiceDeps {
  return {
    // The seeder never sends: nudges are a live-traffic concern and a
    // seeded thread has no one to notify.
    getProvider: async () => Promise.resolve(null),
    resolveCallerIdByPurpose: async () => Promise.resolve(null),
    fieldEncryptor: deps.fieldEncryptor,
    blobStore: deps.blobStore,
    notificationService: deps.notificationService,
    orgId: deps.orgId,
    orgSchema: deps.orgSchema,
    orgSlug: deps.orgSlug,
  };
}

// ---------------------------------------------------------------------------
// Client email seeding
// ---------------------------------------------------------------------------

/** Seeded email address for the anchor ticket's client. */
const ANCHOR_CLIENT_EMAIL = "maria.l@example.org";

/**
 * Store an email address on the anchor ticket's client, following the
 * same storage shape as email-service.ts: encrypted address, blind-index
 * hash, and the client FK update. Audit logging is skipped for seed data.
 */
async function seedClientEmail(
  deps: SeedPortalDeps,
  clientId: ClientId,
): Promise<void> {
  const { tDb, fieldEncryptor, blindIndexer, orgId } = deps;

  const encryptedAddress = fieldEncryptor.encrypt(ANCHOR_CLIENT_EMAIL);
  const emailHash = emailHashSchema.parse(
    blindIndexer.hash(ANCHOR_CLIENT_EMAIL, orgId),
  );

  const row = await tDb
    .insertInto("emails")
    .values({
      email_hash: emailHash,
      encrypted_address: encryptedAddress,
      email_match_hash: null,
      locale: "en-US",
    })
    .returning("id")
    .executeTakeFirstOrThrow();

  await tDb
    .updateTable("clients")
    .set({ email_id: row.id, updated_at: new Date() })
    .where("id", "=", clientId)
    .execute();
}

// ---------------------------------------------------------------------------
// Reply token seeding
// ---------------------------------------------------------------------------

/**
 * Seed an active (unrevoked) email_reply_tokens row for the anchor ticket
 * so the ticket panel's revoke action has something to act on.
 *
 * The token_hash is a deterministic placeholder. No real token is minted
 * because the demo has no SMTP receiver to resolve it, and the hash is
 * never looked up. Only the row's existence (with revoked_at = null)
 * matters for the UI.
 */
async function seedReplyToken(
  tDb: Kysely<TenantDatabase>,
  ticketId: TicketId,
): Promise<void> {
  // Deterministic hex string minted through the schema. Not a real HMAC;
  // just needs to be non-null and unique.
  const placeholderHash = replyTokenHashSchema.parse(
    "seed0000000000000000000000000000000000000000000000000000deadbeef",
  );

  await tDb
    .insertInto("email_reply_tokens")
    .values({
      ticket_id: ticketId,
      token_hash: placeholderHash,
    })
    .execute();
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export async function seedPortal(
  deps: SeedPortalDeps,
): Promise<SeedPortalResult> {
  const { tDb } = deps;

  const queues = await tDb
    .selectFrom("queues")
    .select("id")
    .where("is_active", "=", true)
    .orderBy("sort_order", "asc")
    .execute();
  const routingQueueIds = queues.map((q) => q.id);

  const anchorClientId = await resolveTicketClient(tDb, deps.anchorTicketId);

  // Store an email address on the anchor client so the ticket panel shows
  // the email contact and the revoke-reply-token action.
  await seedClientEmail(deps, anchorClientId);

  // Seed an active reply token row so the revoke action has something to
  // act on when the demo user opens the ticket panel.
  await seedReplyToken(tDb, deps.anchorTicketId);

  // Secure Link and the account are mutually exclusive tiers on one client
  // (the partial unique index rejects two active channels), so the account
  // attaches to its own client, created by its own intake submission.
  const secureLink = await seedSecureLink(deps, anchorClientId);

  // Seal the anchor ticket's media (recordings, attachments) to the
  // channel's client_public. The ticket seeder wrote the file_key_wrap
  // (org side); this completes the envelope by writing portal carrier
  // rows (client side).
  await sealAnchorTicketMedia(deps, secureLink.channel);

  // Mirror every text-bearing follow-up on the anchor ticket to the
  // portal channel. seedSecureLink wrote two purpose-made messages;
  // this adds the rest of the conversation so the client thread matches
  // the org thread (ADR-087 parity rule). Runs after seedSecureLink so
  // the two existing rows hit the onConflictIgnore path harmlessly.
  await sealAnchorTicketMessages(deps, secureLink.channel);

  const share = await seedShareLink(deps);

  const forms = await seedForms(deps, routingQueueIds);
  const housingQueue = routingQueueIds[0] ?? null;
  const crisisQueue = routingQueueIds[1] ?? housingQueue;
  const [housingOption, crisisOption] = forms.queueOptionKeys;

  const responseTicketIds: TicketId[] = [];

  responseTicketIds.push(
    await submitSeedResponse(
      deps,
      forms.customFormId,
      [
        {
          fieldKey: "preferred-name",
          fieldType: "text",
          label: "What should we call you?",
          value: "Rowan",
        },
        {
          fieldKey: "topic",
          fieldType: "select",
          label: "What brings you here today?",
          value: housingOption ?? "",
        },
        {
          fieldKey: "situation",
          fieldType: "textarea",
          label: "Tell us what is going on",
          value:
            "I lost my place last week and have been staying on a friend's floor. I need somewhere for the next few nights.",
        },
        {
          fieldKey: "text-ok",
          fieldType: "checkbox",
          label: "It is safe to text this number",
          value: false,
        },
      ],
      { resolvedQueueId: housingQueue, resolvedPriority: "normal" },
    ),
  );

  responseTicketIds.push(
    await submitSeedResponse(
      deps,
      forms.customFormId,
      [
        {
          fieldKey: "topic",
          fieldType: "select",
          label: "What brings you here today?",
          value: crisisOption ?? "",
        },
        {
          fieldKey: "situation",
          fieldType: "textarea",
          label: "Tell us what is going on",
          value:
            "Someone is watching the house. I do not want to say more here.",
        },
        {
          fieldKey: "text-ok",
          fieldType: "checkbox",
          label: "It is safe to text this number",
          value: true,
        },
        {
          fieldKey: "phone",
          fieldType: "text",
          label: "Phone number",
          value: "+15550142",
        },
        {
          fieldKey: "quiet-hours",
          fieldType: "text",
          label: "Hours when a text would not be safe",
          value: "6pm to 11pm",
        },
      ],
      { resolvedQueueId: crisisQueue, resolvedPriority: "high" },
    ),
  );

  const keyNotHeldTicketId = await submitSeedResponse(
    deps,
    forms.customFormId,
    [
      {
        fieldKey: "topic",
        fieldType: "select",
        label: "What brings you here today?",
        value: housingOption ?? "",
      },
      {
        fieldKey: "situation",
        fieldType: "textarea",
        label: "Tell us what is going on",
        value: "Asking on behalf of my sister, she cannot use a phone safely.",
      },
    ],
    { resolvedQueueId: housingQueue, resolvedPriority: "normal" },
  );
  responseTicketIds.push(keyNotHeldTicketId);

  // Drop every wrap on the last response so the viewer has a real
  // key-not-held row. This is the shape the product reaches when a
  // response converts to per-volunteer wraps and the reader is not one of
  // them: the interim org seal is gone and no personal wrap replaced it.
  await tDb
    .deleteFrom("intake_key_wraps")
    .where("ticket_id", "=", keyNotHeldTicketId)
    .execute();
  await tDb
    .deleteFrom("ticket_key_wraps")
    .where("ticket_id", "=", keyNotHeldTicketId)
    .execute();

  // The account rides the client created by the first seeded submission,
  // which has a thread of its own and no competing active channel.
  const accountTicketId = responseTicketIds[0];
  if (accountTicketId === undefined) {
    throw new InternalError("seedPortal produced no intake responses");
  }
  const accountClientId = await resolveTicketClient(tDb, accountTicketId);
  const accountId = await seedAccount(deps, accountClientId);

  return {
    portalChannelId: secureLink.channelId,
    portalFragment: secureLink.fragment,
    shareId: share.shareId,
    shareFragment: share.fragment,
    accountId,
    accountUsername: deps.accountUsername,
    accountPassword: deps.accountPassword,
    customFormId: forms.customFormId,
    customFormSlug: forms.customFormSlug,
    closedFormId: forms.closedFormId,
    responseTicketIds,
    keyNotHeldTicketId,
  };
}
