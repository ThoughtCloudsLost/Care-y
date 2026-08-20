<!--
  Shared intake form body. Used by both /intake and /intake/[slug].
  Takes an optional slug prop; when null, resolves the default form.
  Handles form loading, decryption, validation, encryption, submission,
  not-available state, and the kill-switch signal.
-->
<script lang="ts">
  import { browser } from "$app/environment";
  import { createQuery, createMutation } from "@tanstack/svelte-query";
  import {
    List,
    ListItem,
    ListInput,
    Button,
    Block,
    Radio,
    BlockTitle,
  } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { portalKeys } from "$lib/query/keys.js";
  import { decode } from "@care-y/crypto";
  import { decryptFieldContent } from "$lib/portal/intake-form-crypto.js";
  import { solveProofOfWork } from "$lib/auth/pow-solver.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import {
    encryptIntake,
    resolveSubmitMetadata,
    buildAccountPayload,
    type IntakeAnswer,
    type IntakeAccountPayload,
  } from "./intake-crypto.js";
  import FieldError from "$lib/components/FieldError.svelte";
  import HowProtected from "$lib/components/portal/HowProtected.svelte";
  import IntakeSubmitHint from "$lib/components/portal/IntakeSubmitHint.svelte";
  import IntakeFieldRenderer from "$lib/components/portal/IntakeFieldRenderer.svelte";
  import type { LoginCryptoCallbacks } from "$lib/auth/login-crypto.js";
  import { buildLoginCallbacks } from "$lib/auth/crypto-callbacks.js";
  import {
    intakeFieldTypeSchema,
    intakeFieldRoleSchema,
    type IntakeFieldConfig,
    type IntakeFieldType,
    type IntakeFieldRole,
    type AvailabilityData,
    type TicketPriority,
    ErrorCode,
  } from "@care-y/shared";

  // ---- Props ----

  interface IntakeFormBodyProps {
    /** Slug for slug-based form resolution, null for default. */
    readonly slug?: string | null;
  }

  let { slug = null }: IntakeFormBodyProps = $props();

  // ---- Types ----

  interface PlaintextField {
    readonly id: string;
    readonly fieldType: IntakeFieldType;
    readonly role: IntakeFieldRole | null;
    readonly label: string;
    readonly config: IntakeFieldConfig;
    readonly isRequired: boolean;
  }

  type ContactMethod = "phone" | "email" | "none";

  // ---- Default form definition ----

  const DEFAULT_INTAKE_FORM: readonly PlaintextField[] = [
    {
      id: "default:name",
      fieldType: "text",
      role: null,
      label: m.intake_field_name_label(),
      config: { type: "text", maxLength: 200, placeholder: undefined },
      isRequired: false,
    },
    {
      id: "default:message",
      fieldType: "textarea",
      role: null,
      label: m.intake_field_message_label(),
      config: {
        type: "textarea",
        maxLength: 5_000,
        placeholder: m.intake_field_message_placeholder(),
      },
      isRequired: true,
    },
  ] as const;

  // ---- Org public key query (dedicated, not from branding cache) ----

  const orgKeyQuery = createQuery(() => ({
    queryKey: portalKeys.orgPublicKey(),
    queryFn: async (): Promise<Uint8Array | null> => {
      if (!trpc.branding) return null;
      const data = await trpc.branding.getPublicBranding.query();
      if (data.orgPublicKey === null) return null;
      return decode(data.orgPublicKey);
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  }));

  const orgPublicKey = $derived(orgKeyQuery.data ?? null);
  const orgKeyUnavailable = $derived(
    !orgKeyQuery.isLoading && orgPublicKey === null,
  );

  // ---- Intake config query (PoW check) ----

  const configQuery = createQuery(() => ({
    queryKey: [...portalKeys.all, "intakeConfig"] as const,
    queryFn: async () => {
      if (!trpc.clientPortal) return { powRequired: false };
      return trpc.clientPortal.getIntakeConfig.query();
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  }));

  const powRequired = $derived(configQuery.data?.powRequired === true);

  // ---- Form definition query ----

  const formQuery = createQuery(() => ({
    queryKey: [...portalKeys.all, "intakeForm", slug] as const,
    queryFn: async () => {
      if (!trpc.clientPortal) {
        return {
          formId: null,
          fields: null,
          slug: null,
          intakeDisabled: false,
        };
      }
      const input = slug != null ? { slug } : undefined;
      return trpc.clientPortal.getIntakeForm.query(input);
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  }));

  // Not-available: intake is disabled or slug was given but not found
  const intakeDisabled = $derived(formQuery.data?.intakeDisabled === true);
  const slugNotFound = $derived(
    slug != null && formQuery.data?.formId == null && !intakeDisabled,
  );
  const notAvailable = $derived(intakeDisabled || slugNotFound);

  // Decrypt form fields when a custom form is returned
  interface ResolvedForm {
    formId: string | null;
    fields: readonly PlaintextField[];
    error: boolean;
  }

  const resolvedForm = $derived.by((): ResolvedForm => {
    const data = formQuery.data;
    if (notAvailable) {
      return { formId: null, fields: [], error: false };
    }
    if (data?.formId == null) {
      return { formId: null, fields: DEFAULT_INTAKE_FORM, error: false };
    }

    if (orgPublicKey === null) {
      return { formId: null, fields: DEFAULT_INTAKE_FORM, error: false };
    }

    try {
      const decrypted: PlaintextField[] = [];
      for (const field of data.fields ?? []) {
        const parsedType = intakeFieldTypeSchema.parse(field.fieldType);
        const parsedRole =
          field.role != null ? intakeFieldRoleSchema.parse(field.role) : null;
        const content = decryptFieldContent(
          {
            encryptedLabel: field.encryptedLabel,
            encryptedConfig: field.encryptedConfig,
          },
          orgPublicKey,
        );
        decrypted.push({
          id: field.id,
          fieldType: parsedType,
          role: parsedRole,
          label: content.label,
          config: content.config,
          isRequired: field.isRequired,
        });
      }
      return { formId: data.formId, fields: decrypted, error: false };
    } catch {
      return { formId: null, fields: [], error: true };
    }
  });

  const isDefaultForm = $derived(
    resolvedForm.formId === null && !resolvedForm.error && !notAvailable,
  );
  const formFields = $derived(resolvedForm.fields);

  // ---- Form state ----

  // Field values keyed by field id
  let fieldValues = $state<
    Record<string, string | string[] | AvailabilityData | boolean | undefined>
  >({});

  // Default-form-specific: contact method radio group
  let contactMethod = $state<ContactMethod>("phone");
  let contactDetail = $state("");

  // Validation errors keyed by field id
  let fieldErrors = $state<Record<string, string | undefined>>({});
  let contactDetailError = $state<string | undefined>(undefined);

  // ---- PoW state ----

  let powSolution = $state<{ challenge: string; solution: string } | null>(
    null,
  );
  let powGeneration = $state(0);
  let powSolving = $state(false);

  // Challenge fetched via TanStack Query (no tRPC in $effect)
  const challengeQuery = createQuery(() => ({
    queryKey: [...portalKeys.all, "intakeChallenge", powGeneration] as const,
    queryFn: async () => {
      if (!trpc.clientPortal) return null;
      return trpc.clientPortal.getIntakeChallenge.query();
    },
    enabled: powRequired,
    staleTime: 4 * 60 * 1000,
    retry: false,
  }));

  // Solve PoW in the background when challenge data arrives.
  // Both exit paths return a cleanup function (validator: no-effect-without-cleanup).
  $effect(() => {
    const challenge = challengeQuery.data;
    if (!browser || !challenge) {
      return (): void => {
        // No-op cleanup for the disabled path
      };
    }

    const generation = ++powGeneration;
    powSolution = null;
    powSolving = true;

    let expiryTimer: ReturnType<typeof setTimeout> | undefined;
    // Object wrapper so the linter does not treat the flag as always-falsy
    // across the await boundary (the cleanup closure sets it asynchronously).
    const state = { cancelled: false };

    void (async (): Promise<void> => {
      try {
        const solution = await solveProofOfWork(
          challenge.challenge,
          challenge.difficulty,
        );

        if (state.cancelled || generation !== powGeneration) return;

        powSolution = {
          challenge: challenge.challenge,
          solution,
        };
        powSolving = false;

        // Schedule re-fetch before expiry
        const expiresMs =
          new Date(challenge.expiresAt).getTime() - Date.now() - 5_000;
        if (expiresMs > 0) {
          expiryTimer = setTimeout((): void => {
            if (!state.cancelled && generation === powGeneration) {
              powGeneration++;
            }
          }, expiresMs);
        }
      } catch {
        if (state.cancelled || generation !== powGeneration) return;
        powSolving = false;
      }
    })();

    return (): void => {
      state.cancelled = true;
      if (expiryTimer !== undefined) clearTimeout(expiryTimer);
    };
  });

  // ---- Account opt-in state ----

  let accountExpanded = $state(false);
  let accountUsername = $state("");
  let accountPassword = $state("");
  let accountConfirmPassword = $state("");
  let accountPending = $state(false);
  let accountError = $state<string | undefined>(undefined);

  const accountShowMismatch = $derived(
    accountConfirmPassword.length > 0 &&
      accountPassword.length > 0 &&
      accountPassword !== accountConfirmPassword,
  );

  // ---- Submission ----

  let submitted = $state(false);
  let reference = $state("");
  let submitError = $state<string | undefined>(undefined);
  let hintShown = $state(false);

  const submitMutation = createMutation(() => ({
    mutationFn: async (payload: {
      ticketId: string;
      followUpId: string | null;
      formId: string | null;
      encryptedTitle: string;
      encryptedDescription: string;
      encryptedMessage?: string;
      encryptedFormResponse: string;
      wrappedTk: string;
      pow?: { challenge: string; solution: string };
      resolvedQueueId?: string | null;
      resolvedPriority?: TicketPriority;
      resolvedEscalationLevel?: string;
      account?: IntakeAccountPayload;
    }) => {
      if (!trpc.clientPortal) {
        throw new Error("Client portal not available");
      }
      return trpc.clientPortal.submitIntake.mutate(payload);
    },
  }));

  const isSubmitting = $derived(submitMutation.isPending);

  // ---- Validation ----

  function validate(): boolean {
    const errors: Record<string, string | undefined> = {};
    let valid = true;

    // Validate dynamic fields
    for (const field of formFields) {
      if (!field.isRequired) continue;
      const val = fieldValues[field.id];

      if (field.fieldType === "text" || field.fieldType === "textarea") {
        if (typeof val !== "string" || val.trim() === "") {
          errors[field.id] =
            field.fieldType === "textarea"
              ? m.intake_error_message_required()
              : m.intake_error_field_required();
          valid = false;
        }
      } else if (field.fieldType === "select") {
        if (typeof val !== "string" || val === "") {
          errors[field.id] = m.intake_error_field_required();
          valid = false;
        }
      } else if (field.fieldType === "multiselect") {
        if (!Array.isArray(val) || val.length === 0) {
          errors[field.id] = m.intake_error_field_required();
          valid = false;
        }
      } else if (field.fieldType === "checkbox") {
        // Consent-type checkbox with requiredTrue: must be checked
        if (
          field.config.type === "checkbox" &&
          field.config.requiredTrue === true &&
          val !== true
        ) {
          errors[field.id] = m.intake_error_field_required();
          valid = false;
        }
      } else {
        // field.fieldType === "availability"
        if (
          val === undefined ||
          typeof val !== "object" ||
          Array.isArray(val) ||
          typeof val === "boolean"
        ) {
          errors[field.id] = m.intake_error_field_required();
          valid = false;
        } else if (val.recurring.length === 0 && val.specific.length === 0) {
          errors[field.id] = m.intake_error_field_required();
          valid = false;
        }
      }
    }

    // Validate default form contact detail
    if (isDefaultForm) {
      if (contactMethod === "phone" && contactDetail.trim() === "") {
        contactDetailError = m.intake_error_field_required();
        valid = false;
      } else if (contactMethod === "email" && contactDetail.trim() === "") {
        contactDetailError = m.intake_error_field_required();
        valid = false;
      } else {
        contactDetailError = undefined;
      }
    }

    // Validate account opt-in fields when the section is expanded
    if (accountExpanded) {
      if (
        accountPassword.length > 0 &&
        accountPassword !== accountConfirmPassword
      ) {
        valid = false;
      }
    }

    fieldErrors = errors;
    return valid;
  }

  function focusFirstError(): void {
    if (!browser) return;
    for (const field of formFields) {
      const fieldErr = fieldErrors[field.id];
      if (fieldErr !== undefined && fieldErr !== "") {
        const el = document.getElementById(`intake-field-${field.id}`);
        if (el) {
          el.focus();
          return;
        }
      }
    }
    if (contactDetailError !== undefined && contactDetailError !== "") {
      const el = document.getElementById("intake-contact-detail");
      if (el) {
        el.focus();
      }
    }
  }

  async function handleSubmit(): Promise<void> {
    if (isSubmitting || submitted) return;
    submitError = undefined;

    if (!validate()) {
      announceToLiveRegion("polite", m.intake_error_field_required());
      focusFirstError();
      return;
    }

    if (orgPublicKey === null) {
      submitError = m.intake_error_encryption_unavailable();
      return;
    }

    // Wait for PoW if still solving
    if (powRequired && powSolution === null && powSolving) {
      // The mutation will fire when solution is ready, handled below
    }

    // Build answers list
    const answers: IntakeAnswer[] = [];

    if (isDefaultForm) {
      // Default form: name, contact method, contact detail, message
      const nameVal = fieldValues["default:name"];
      if (typeof nameVal === "string" && nameVal.trim() !== "") {
        answers.push({
          fieldId: "default:name",
          fieldType: "text",
          label: m.intake_field_name_label(),
          value: nameVal,
        });
      }

      // Contact method as a text answer
      let contactMethodLabel: string;
      switch (contactMethod) {
        case "phone":
          contactMethodLabel = m.intake_contact_phone();
          break;
        case "email":
          contactMethodLabel = m.intake_contact_email();
          break;
        case "none":
          contactMethodLabel = m.intake_contact_none();
          break;
      }
      answers.push({
        fieldId: "default:contact-method",
        fieldType: "text",
        label: m.intake_contact_method_label(),
        value: contactMethodLabel,
      });

      // Contact detail (when applicable)
      if (contactMethod !== "none" && contactDetail.trim() !== "") {
        answers.push({
          fieldId: "default:contact-detail",
          fieldType: "text",
          label:
            contactMethod === "phone"
              ? m.intake_field_contact_detail_phone_label()
              : m.intake_field_contact_detail_email_label(),
          value: contactDetail,
        });
      }

      // Message
      const msgVal = fieldValues["default:message"];
      if (typeof msgVal === "string") {
        answers.push({
          fieldId: "default:message",
          fieldType: "textarea",
          label: m.intake_field_message_label(),
          value: msgVal,
        });
      }
    } else {
      // Custom form: all fields in order
      for (const field of formFields) {
        const val = fieldValues[field.id];
        if (val === undefined) continue;
        answers.push({
          fieldId: field.id,
          fieldType: field.fieldType,
          label: field.label,
          value: val,
        });
      }
    }

    // Mint ids for AAD binding
    const ticketId = crypto.randomUUID();
    const hasTextarea = answers.some((a) => a.fieldType === "textarea");
    const followUpId = hasTextarea ? crypto.randomUUID() : null;

    // Encrypt (synchronous, fail closed)
    let encrypted;
    try {
      encrypted = encryptIntake(resolvedForm.formId, answers, orgPublicKey, {
        ticketId,
        followUpId,
      });
    } catch {
      submitError = m.intake_error_generic();
      return;
    }

    // Resolve submit-time metadata from decrypted field configs (ADR-068)
    const metadata = resolveSubmitMetadata(formFields, fieldValues);

    // Build mutation payload
    const payload: {
      ticketId: string;
      followUpId: string | null;
      formId: string | null;
      encryptedTitle: string;
      encryptedDescription: string;
      encryptedMessage?: string;
      encryptedFormResponse: string;
      wrappedTk: string;
      pow?: { challenge: string; solution: string };
      resolvedQueueId?: string | null;
      resolvedPriority?: TicketPriority;
      resolvedEscalationLevel?: string;
      account?: IntakeAccountPayload;
    } = {
      ticketId,
      followUpId,
      formId: resolvedForm.formId,
      encryptedTitle: encrypted.encryptedTitle,
      encryptedDescription: encrypted.encryptedDescription,
      encryptedFormResponse: encrypted.encryptedFormResponse,
      wrappedTk: encrypted.wrappedTk,
    };

    if (encrypted.encryptedMessage !== null) {
      payload.encryptedMessage = encrypted.encryptedMessage;
    }

    if (powRequired && powSolution !== null) {
      payload.pow = powSolution;
    }

    // Attach resolved metadata when present
    if (metadata.resolvedQueueId != null) {
      payload.resolvedQueueId = metadata.resolvedQueueId;
    }
    if (metadata.resolvedPriority != null) {
      payload.resolvedPriority = metadata.resolvedPriority;
    }
    if (metadata.resolvedEscalationLevel != null) {
      payload.resolvedEscalationLevel = metadata.resolvedEscalationLevel;
    }

    // Account opt-in: derive keys and build the account payload
    // when the section is expanded and the user filled in credentials.
    const wantsAccount =
      accountExpanded &&
      accountUsername.trim().length >= 3 &&
      accountPassword.length >= 8 &&
      accountPassword === accountConfirmPassword;

    if (wantsAccount) {
      accountPending = true;
      accountError = undefined;

      // Find the message text for the selfCopy (first textarea answer)
      const messageForCopy = answers.find(
        (a) => a.fieldType === "textarea" && typeof a.value === "string",
      );
      const messageText =
        messageForCopy !== undefined && typeof messageForCopy.value === "string"
          ? messageForCopy.value
          : null;

      // Single indeterminate progressbar; phases are not surfaced separately.
      const callbacks: LoginCryptoCallbacks = buildLoginCallbacks(
        () => undefined,
      );

      try {
        const accountPayload = await buildAccountPayload(
          accountUsername,
          accountPassword,
          messageText,
          callbacks,
        );
        payload.account = accountPayload;
      } catch {
        accountPending = false;
        submitError = m.intake_error_generic();
        return;
      } finally {
        accountPending = false;
        // Clear passwords from local state after payload assembly
        accountPassword = "";
        accountConfirmPassword = "";
      }
    }

    try {
      const result = await submitMutation.mutateAsync(payload);
      reference = result.reference;
      submitted = true;
      hintShown = true;
      announceToLiveRegion("polite", m.intake_success_heading());

      // Focus the success heading after render
      requestAnimationFrame(() => {
        const heading = document.getElementById("intake-success-heading");
        if (heading) heading.focus();
      });
    } catch (err: unknown) {
      handleSubmitError(err);
    }
  }

  let challengeRetried = $state(false);

  function extractTrpcInfo(v: unknown): {
    code: string | undefined;
    message: string;
  } {
    let message = "";
    let code: string | undefined;
    if (typeof v === "object" && v !== null) {
      if ("message" in v && typeof v.message === "string") {
        message = v.message;
      }
      if ("data" in v && typeof v.data === "object" && v.data !== null) {
        const data = v.data;
        if ("code" in data && typeof data.code === "string") {
          code = data.code;
        }
      }
    }
    return { code, message };
  }

  function handleSubmitError(err: unknown): void {
    const { code, message } = extractTrpcInfo(err);

    if (code === "TOO_MANY_REQUESTS") {
      const match = /(\d+)s/.exec(message);
      const matchedValue = match?.[1];
      const seconds =
        matchedValue !== undefined ? parseInt(matchedValue, 10) : 3600;
      const minutes = Math.ceil(seconds / 60);
      submitError = m.intake_error_rate_limited({ minutes: String(minutes) });
      announceToLiveRegion("polite", submitError);
      focusError();
      return;
    }

    // A taken username surfaces inline without discarding the typed form
    if (code === "CONFLICT" && message === ErrorCode.ACCOUNT_USERNAME_TAKEN) {
      accountError = m.account_username_taken();
      announceToLiveRegion("polite", m.account_username_taken());
      requestAnimationFrame(() => {
        const el = document.getElementById("account-create-username");
        if (el) el.focus();
      });
      return;
    }

    // Challenge failure: retry once automatically
    if (
      code === "BAD_REQUEST" &&
      message.includes("challenge") &&
      !challengeRetried
    ) {
      challengeRetried = true;
      powGeneration++;
      submitError = undefined;
      return;
    }

    submitError = m.intake_error_generic();
    announceToLiveRegion("polite", m.intake_error_generic());
    focusError();
  }

  function focusError(): void {
    if (!browser) return;
    requestAnimationFrame(() => {
      const el = document.getElementById("intake-submit-error");
      if (el) el.focus();
    });
  }

  // ---- Field change handler ----

  function handleFieldChange(
    fieldId: string,
    value: string | string[] | AvailabilityData | boolean,
  ): void {
    fieldValues = { ...fieldValues, [fieldId]: value };
    const existingErr = fieldErrors[fieldId]; // eslint-disable-line security/detect-object-injection -- fieldId comes from the form definition array, not user input
    if (existingErr !== undefined && existingErr !== "") {
      fieldErrors = { ...fieldErrors, [fieldId]: undefined };
    }
  }

  // ---- Contact method handlers (default form only) ----

  function handleContactMethodChange(method: ContactMethod): void {
    contactMethod = method;
    contactDetail = "";
    contactDetailError = undefined;
  }

  function handleContactDetailInput(e: Event): void {
    const target = e.target;
    if (target instanceof HTMLInputElement) {
      contactDetail = target.value;
      contactDetailError = undefined;
    }
  }

  // ---- Derived state ----

  const contactMethodLabelId = "intake-contact-method-label";
  const contactDetailInputId = "intake-contact-detail";

  const submitDisabled = $derived(
    isSubmitting ||
      accountPending ||
      submitted ||
      orgKeyUnavailable ||
      resolvedForm.error ||
      (powRequired && powSolving && powSolution === null),
  );
</script>

<noscript>
  <Block>
    <p>{m.intake_noscript()}</p>
  </Block>
</noscript>

{#if notAvailable}
  <!-- Not-available state: intake disabled or slug not found -->
  <Block>
    <p class="intake-not-available" role="status">
      {m.intake_not_available()}
    </p>
  </Block>
{:else if submitted}
  <!-- Success state -->
  <Block>
    <h2
      id="intake-success-heading"
      class="intake-success-heading"
      tabindex="-1"
    >
      {m.intake_success_heading()}
    </h2>
    <p class="intake-success-body">{m.intake_success_body()}</p>
  </Block>

  <Block>
    <p class="intake-reference-label">{m.intake_reference_label()}</p>
    <code class="intake-reference-code" data-testid="intake-reference">
      {reference}
    </code>
    <p class="intake-reference-save">{m.intake_reference_save()}</p>
  </Block>

  {#if accountExpanded && accountUsername.trim().length > 0}
    <Block>
      <div
        class="intake-account-reminder"
        data-testid="intake-account-reminder"
      >
        <p class="intake-account-reminder-text">
          {m.account_intake_confirm_reminder({ username: accountUsername })}
        </p>
      </div>
    </Block>
  {/if}

  <IntakeSubmitHint
    opened={hintShown}
    ondismiss={() => {
      hintShown = false;
    }}
  />
{:else}
  <!-- Form state -->
  <Block>
    <p class="intake-intro">{m.intake_intro()}</p>
  </Block>

  <HowProtected />

  {#if resolvedForm.error}
    <Block>
      <p class="intake-error" role="alert">
        {m.intake_error_generic()}
      </p>
    </Block>
  {:else if orgKeyUnavailable}
    <Block>
      <p class="intake-error" role="alert">
        {m.intake_error_encryption_unavailable()}
      </p>
    </Block>
  {:else}
    <!-- Dynamic form fields -->
    {#each formFields as field (field.id)}
      <IntakeFieldRenderer
        fieldId={field.id}
        label={field.label}
        config={field.config}
        isRequired={field.isRequired}
        role={field.role}
        value={fieldValues[field.id]}
        error={fieldErrors[field.id]}
        onchange={(val: string | string[] | AvailabilityData | boolean) =>
          handleFieldChange(field.id, val)}
      />
    {/each}

    <!-- Default form: contact method radio group + conditional detail field -->
    {#if isDefaultForm}
      <BlockTitle id={contactMethodLabelId}>
        {m.intake_contact_method_label()}
      </BlockTitle>
      <List
        strong
        inset
        role="radiogroup"
        aria-labelledby={contactMethodLabelId}
      >
        <ListItem label title={m.intake_contact_phone()}>
          {#snippet media()}
            <Radio
              component="div"
              name="contact-method"
              value="phone"
              checked={contactMethod === "phone"}
              onChange={() => handleContactMethodChange("phone")}
            />
          {/snippet}
        </ListItem>
        <ListItem label title={m.intake_contact_email()}>
          {#snippet media()}
            <Radio
              component="div"
              name="contact-method"
              value="email"
              checked={contactMethod === "email"}
              onChange={() => handleContactMethodChange("email")}
            />
          {/snippet}
        </ListItem>
        <ListItem label title={m.intake_contact_none()}>
          {#snippet media()}
            <Radio
              component="div"
              name="contact-method"
              value="none"
              checked={contactMethod === "none"}
              onChange={() => handleContactMethodChange("none")}
            />
          {/snippet}
        </ListItem>
      </List>

      {#if contactMethod === "phone"}
        <label for={contactDetailInputId} class="sr-only">
          {m.intake_field_contact_detail_phone_label()}
        </label>
        <List strong inset>
          <ListInput
            inputId={contactDetailInputId}
            type="tel"
            placeholder={m.intake_field_contact_detail_phone_label()}
            value={contactDetail}
            autocomplete="off"
            required
            onInput={handleContactDetailInput}
          />
        </List>
        <FieldError message={contactDetailError} />
      {:else if contactMethod === "email"}
        <label for={contactDetailInputId} class="sr-only">
          {m.intake_field_contact_detail_email_label()}
        </label>
        <List strong inset>
          <ListInput
            inputId={contactDetailInputId}
            type="email"
            placeholder={m.intake_field_contact_detail_email_label()}
            value={contactDetail}
            autocomplete="off"
            required
            onInput={handleContactDetailInput}
          />
        </List>
        <FieldError message={contactDetailError} />
      {:else if contactMethod === "none"}
        <Block>
          <p class="intake-contact-none-note">
            {m.intake_contact_none_note()}
          </p>
        </Block>
      {/if}
    {/if}

    <!-- Account opt-in disclosure (collapsed by default) -->
    <Block>
      <button
        class="intake-account-toggle"
        type="button"
        aria-expanded={accountExpanded}
        onclick={() => {
          accountExpanded = !accountExpanded;
        }}
        disabled={isSubmitting || accountPending}
        data-testid="intake-account-toggle"
      >
        <span class="intake-account-toggle-arrow"
          >{accountExpanded ? "▾" : "▸"}</span
        >
        <span class="intake-account-toggle-content">
          <span class="intake-account-toggle-title"
            >{m.account_intake_optin_title()}</span
          >
          <span class="intake-account-toggle-body"
            >{m.account_intake_optin_body()}</span
          >
        </span>
      </button>
    </Block>

    {#if accountExpanded}
      <Block>
        <List strong inset class="intake-account-fields">
          <ListInput
            type="text"
            inputId="account-create-username"
            placeholder={m.account_login_username()}
            value={accountUsername}
            onInput={(e: Event) => {
              if (e.target instanceof HTMLInputElement) {
                accountUsername = e.target.value;
                accountError = undefined;
              }
            }}
            disabled={isSubmitting || accountPending}
            autocomplete="off"
            data-testid="account-create-username"
          >
            {#snippet label()}
              <span class="sr-only">{m.account_login_username()}</span>
            {/snippet}
          </ListInput>
          <ListInput
            type="password"
            inputId="account-create-password"
            placeholder={m.account_login_password()}
            value={accountPassword}
            onInput={(e: Event) => {
              if (e.target instanceof HTMLInputElement)
                accountPassword = e.target.value;
            }}
            disabled={isSubmitting || accountPending}
            data-testid="account-create-password"
          >
            {#snippet label()}
              <span class="sr-only">{m.account_login_password()}</span>
            {/snippet}
          </ListInput>
          <ListInput
            type="password"
            inputId="account-create-confirm"
            placeholder={m.account_create_confirm()}
            value={accountConfirmPassword}
            onInput={(e: Event) => {
              if (e.target instanceof HTMLInputElement)
                accountConfirmPassword = e.target.value;
            }}
            disabled={isSubmitting || accountPending}
            data-testid="account-create-confirm"
          >
            {#snippet label()}
              <span class="sr-only">{m.account_create_confirm()}</span>
            {/snippet}
          </ListInput>
        </List>

        {#if accountShowMismatch}
          <p class="intake-account-mismatch" data-testid="account-mismatch">
            {m.account_create_mismatch()}
          </p>
        {/if}

        {#if accountError}
          <p
            id="intake-account-error"
            class="intake-error"
            tabindex="-1"
            data-testid="account-create-error"
          >
            {accountError}
          </p>
        {/if}

        <p class="intake-account-hint">{m.account_create_username_hint()}</p>
        <p class="intake-account-hint">{m.account_create_password_hint()}</p>

        <div class="intake-account-warnings">
          <p class="intake-account-warning" data-testid="warning-password">
            {m.account_create_warning_password()}
          </p>
          <p class="intake-account-warning" data-testid="warning-reset">
            {m.account_create_warning_reset()}
          </p>
        </div>
      </Block>
    {/if}

    <!-- Submit error -->
    {#if submitError}
      <Block>
        <p
          id="intake-submit-error"
          class="intake-error"
          role="alert"
          tabindex="-1"
        >
          {submitError}
        </p>
      </Block>
    {/if}

    <!-- Submit button -->
    <Block>
      <Button
        large
        disabled={submitDisabled}
        onclick={() => void handleSubmit()}
        data-testid="intake-submit"
      >
        {#if isSubmitting || accountPending || (powRequired && powSolving && !submitted)}
          <span
            role="progressbar"
            aria-label={accountPending
              ? m.account_unlocking()
              : m.intake_solving_challenge()}
            class="intake-progress"
          >
            {accountPending
              ? m.account_unlocking()
              : m.intake_solving_challenge()}
          </span>
        {:else}
          {m.intake_submit()}
        {/if}
      </Button>
    </Block>
  {/if}
{/if}

<style>
  .intake-intro {
    color: var(--muted);
    font-size: var(--text-sm);
    line-height: 1.5;
  }

  .intake-not-available {
    color: var(--muted);
    font-size: var(--text-sm);
    line-height: 1.5;
    text-align: center;
    padding: var(--space-xl) 0;
  }

  .intake-success-heading {
    font-size: var(--text-md);
    font-weight: 600;
    color: var(--ink);
    margin: 0 0 var(--space-sm);
    outline: none;
  }

  .intake-success-body {
    font-size: var(--text-sm);
    color: var(--muted);
    line-height: 1.5;
  }

  .intake-reference-label {
    font-size: var(--text-sm);
    color: var(--ink);
    margin: 0 0 var(--space-xs);
  }

  .intake-reference-code {
    display: block;
    font-size: var(--text-base);
    font-weight: 600;
    padding: var(--space-sm) var(--space-md);
    background: var(--raised);
    border-radius: 8px;
    user-select: all;
    -webkit-user-select: all;
    text-align: center;
    margin: 0 0 var(--space-sm);
  }

  .intake-reference-save {
    font-size: var(--text-sm);
    color: var(--muted);
  }

  .intake-error {
    color: var(--danger);
    font-size: var(--text-sm);
    font-weight: 500;
    outline: none;
  }

  .intake-contact-none-note {
    color: var(--muted);
    font-size: var(--text-sm);
    font-style: italic;
  }

  .intake-progress {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
  }

  @media (prefers-reduced-motion: reduce) {
    .intake-progress {
      animation: none;
    }
  }

  .intake-account-toggle {
    display: flex;
    align-items: flex-start;
    gap: var(--space-sm);
    width: 100%;
    padding: var(--space-sm) 0;
    min-height: 44px;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    color: var(--ink);
    font-size: var(--text-sm);
    -webkit-tap-highlight-color: transparent;
  }

  .intake-account-toggle:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .intake-account-toggle-arrow {
    flex-shrink: 0;
    font-size: var(--text-base);
    line-height: 1.5;
  }

  .intake-account-toggle-content {
    display: flex;
    flex-direction: column;
  }

  .intake-account-toggle-title {
    font-weight: 500;
    line-height: 1.5;
  }

  .intake-account-toggle-body {
    color: var(--muted);
    line-height: 1.5;
  }

  .intake-account-reminder {
    padding: var(--space-sm) var(--space-md);
    border-radius: 8px;
    background: var(--raised);
  }

  .intake-account-reminder-text {
    font-size: var(--text-sm);
    color: var(--ink);
    line-height: 1.5;
    margin: 0;
  }

  :global(.intake-account-fields) {
    margin: 0 !important;
  }

  .intake-account-hint {
    font-size: var(--text-sm);
    color: var(--muted);
    margin-top: var(--space-sm);
    line-height: 1.5;
  }

  .intake-account-mismatch {
    font-size: var(--text-sm);
    color: var(--danger);
    margin-top: var(--space-xs);
  }

  .intake-account-warnings {
    margin-top: var(--space-md);
    padding: var(--space-sm) var(--space-md);
    border-radius: 8px;
    background: var(--careful-bg, rgba(234, 179, 8, 0.08));
  }

  .intake-account-warning {
    font-size: var(--text-sm);
    color: var(--careful-text, var(--ink));
    line-height: 1.5;
    margin: 0;
  }

  .intake-account-warning + .intake-account-warning {
    margin-top: var(--space-xs);
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
