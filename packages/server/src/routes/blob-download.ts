/**
 * HTTP handler for downloading encrypted blobs as application/octet-stream.
 *
 * Path: /api/blobs/<category>/<uuid>
 * Categories: recordings, attachments, kb-attachments
 *
 * Authenticated. The handler validates the session, checks role permissions,
 * delegates to the appropriate media service for record lookup and access
 * control, then streams the encrypted blob from BlobStore.
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import type { Kysely } from "kysely";
import { Permission } from "@care-y/shared";
import type { OrgSchema, UserId, BlobKey } from "@care-y/shared";
import {
  recordingIdSchema,
  attachmentIdSchema,
  kbAttachmentIdSchema,
} from "@care-y/shared";
import { hasPermissionForOrg } from "../auth/roles.js";
import { NotFoundError, ForbiddenError } from "../errors.js";
import type { BlobStore } from "../storage/store.js";
import type { MediaService } from "../tickets/media-service.js";
import type { KBMediaService } from "../kb/kb-media-service.js";
import type { TenantDatabase } from "../db/types.js";
import {
  authenticateRelay,
  sendJsonResponse,
  type OrgResolver,
} from "./relay-utils.js";
import type { SessionRepository } from "../auth/session-repository.js";

type BlobCategory = "recordings" | "attachments" | "kb-attachments";

const PATH_PREFIX = "/api/blobs/";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const VALID_CATEGORIES: ReadonlySet<string> = new Set<BlobCategory>([
  "recordings",
  "attachments",
  "kb-attachments",
]);

export interface BlobDownloadHandlerDeps {
  readonly blobStore: BlobStore;
  readonly orgResolver: OrgResolver;
  readonly createSessionRepo: (
    orgSchema: OrgSchema,
  ) => SessionRepository | Promise<SessionRepository>;
  readonly corsHeaders: Readonly<Record<string, string>>;
  readonly createMediaSvc: (orgSchema: OrgSchema) => MediaService;
  readonly createKBMediaSvc: (orgSchema: OrgSchema) => KBMediaService;
  readonly getUserRole: (
    orgSchema: OrgSchema,
    userId: UserId,
  ) => Promise<string | null>;
  readonly createTenantDb: (orgSchema: OrgSchema) => Kysely<TenantDatabase>;
}

export function createBlobDownloadHandler(
  deps: BlobDownloadHandlerDeps,
): (req: IncomingMessage, res: ServerResponse) => Promise<void> {
  const {
    blobStore,
    orgResolver,
    createSessionRepo,
    corsHeaders,
    createMediaSvc,
    createKBMediaSvc,
    getUserRole,
    createTenantDb,
  } = deps;

  return async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    if (req.method !== "GET") {
      res.writeHead(405, { Allow: "GET" });
      res.end();
      return;
    }

    const rawUrl = req.url ?? "";
    const qIdx = rawUrl.indexOf("?");
    const url = qIdx === -1 ? rawUrl : rawUrl.slice(0, qIdx);
    if (!url.startsWith(PATH_PREFIX)) {
      sendJsonResponse(res, 404, { error: "not_found" });
      return;
    }

    const pathAfterPrefix = url.slice(PATH_PREFIX.length);
    const slashIdx = pathAfterPrefix.indexOf("/");
    if (slashIdx === -1) {
      sendJsonResponse(res, 400, { error: "invalid_path" });
      return;
    }

    const category = pathAfterPrefix.slice(0, slashIdx);
    const id = pathAfterPrefix.slice(slashIdx + 1);

    if (!VALID_CATEGORIES.has(category)) {
      sendJsonResponse(res, 400, { error: "invalid_category" });
      return;
    }

    if (!UUID_RE.test(id)) {
      sendJsonResponse(res, 400, { error: "invalid_id" });
      return;
    }

    const auth = await authenticateRelay(req, orgResolver, createSessionRepo);
    if (!auth.ok) {
      sendJsonResponse(res, auth.status, { error: "unauthorized" });
      return;
    }

    const { orgSchema, userId } = auth.session;

    const roleId = await getUserRole(orgSchema, userId);
    const tDb = createTenantDb(orgSchema);
    if (
      roleId === null ||
      !(await hasPermissionForOrg(
        tDb,
        orgSchema,
        roleId,
        Permission.VIEW_TICKETS,
      ))
    ) {
      sendJsonResponse(res, 403, { error: "forbidden" });
      return;
    }

    try {
      let blobKey: BlobKey;

      if (category === "recordings") {
        const svc = createMediaSvc(orgSchema);
        const recordingId = recordingIdSchema.parse(id);
        const record = await svc.getRecording(userId, recordingId);
        blobKey = record.blobKey;
      } else if (category === "attachments") {
        const svc = createMediaSvc(orgSchema);
        const attachmentId = attachmentIdSchema.parse(id);
        const record = await svc.getAttachment(userId, attachmentId);
        blobKey = record.blobKey;
      } else {
        const svc = createKBMediaSvc(orgSchema);
        const kbAttachmentId = kbAttachmentIdSchema.parse(id);
        const record = await svc.getAttachment(kbAttachmentId);
        blobKey = record.blobKey;
      }

      const blob = await blobStore.get(blobKey);
      if (blob === null) {
        sendJsonResponse(res, 404, { error: "blob_not_found" });
        return;
      }

      res.writeHead(200, {
        ...corsHeaders,
        "Content-Type": "application/octet-stream",
        "Content-Length": String(blob.length),
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
      });
      res.end(blob);
    } catch (err: unknown) {
      if (err instanceof NotFoundError) {
        sendJsonResponse(res, 404, { error: "not_found" });
      } else if (err instanceof ForbiddenError) {
        sendJsonResponse(res, 403, { error: "forbidden" });
      } else {
        sendJsonResponse(res, 500, { error: "internal_error" });
      }
    }
  };
}
