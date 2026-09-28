import {
  expressionBuilder,
  type Expression,
  type ExpressionWrapper,
  type SqlBool,
} from "kysely";
import type { TicketId } from "@care-y/shared";
import type { TenantDatabase } from "../db/types.js";

/**
 * EXISTS predicate for "someone has responded to this ticket", the rule
 * that separates New from Active. A response is a volunteer-sourced
 * follow-up other than an internal note (a reply, outbound text or email,
 * or an outbound call attempt), or any answered call, inbound included.
 * The inbound message that opened the ticket, system events and internal
 * notes leave it New. Deleted rows never count.
 *
 * The builder is created here with no tables in scope, so the helper
 * assumes nothing about the calling query. Callers pass the ticket id as
 * an expression, usually `eb.ref("t.id")`, and alias the result:
 * ```ts
 * .select((eb) => [hasResponse(eb.ref("t.id")).as("has_response")])
 * ```
 */
export function hasResponse(
  ticketId: Expression<TicketId>,
): ExpressionWrapper<TenantDatabase, never, SqlBool> {
  const eb = expressionBuilder<TenantDatabase>();
  return eb.exists(
    eb
      .selectFrom("followups as f")
      .select(eb.lit(1).as("one"))
      .where("f.ticket_id", "=", ticketId)
      .where("f.deleted_at", "is", null)
      .where((w) =>
        w.or([
          w.and([
            w("f.source", "=", "volunteer"),
            w("f.type", "!=", "internal_note"),
          ]),
          w.and([
            w("f.type", "=", "phone_call"),
            w("f.call_status", "=", "completed"),
          ]),
        ]),
      ),
  );
}
