/**
 * Admin CRUD routes for PhoneGreeting and SMSResponse content.
 *
 * All endpoints require admin-level permissions (MANAGE_ROLES).
 * Business logic is delegated to TelephonyContentService, which
 * creates repositories internally from the tenant-scoped DB.
 */

import { router, adminProcedure, withErrorWrapping } from "../trpc/trpc.js";
import { createTelephonyContentService } from "../telephony/telephony-content-service.js";
import {
  createGreetingInputSchema,
  updateGreetingInputSchema,
  deleteGreetingInputSchema,
  listGreetingsInputSchema,
  createSmsResponseInputSchema,
  updateSmsResponseInputSchema,
  deleteSmsResponseInputSchema,
  listSmsResponsesInputSchema,
} from "@care-y/shared";

// care-y-ignore-next-line missing-return-type -- tRPC router() returns a deeply generic type that cannot be written explicitly
export function createTelephonyContentRouter() {
  return router({
    listGreetings: adminProcedure.input(listGreetingsInputSchema).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = createTelephonyContentService(ctx.org.tenantDb);
        return svc.listGreetings(input.phoneId);
      }),
    ),

    createGreeting: adminProcedure.input(createGreetingInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = createTelephonyContentService(ctx.org.tenantDb);
        return svc.createGreeting(input);
      }),
    ),

    updateGreeting: adminProcedure.input(updateGreetingInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = createTelephonyContentService(ctx.org.tenantDb);
        return svc.updateGreeting(input.id, {
          text: input.text,
          isAudio: input.isAudio,
        });
      }),
    ),

    deleteGreeting: adminProcedure.input(deleteGreetingInputSchema).mutation(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = createTelephonyContentService(ctx.org.tenantDb);
        await svc.deleteGreeting(input.id);
        return { success: true as const };
      }),
    ),

    listSmsResponses: adminProcedure.input(listSmsResponsesInputSchema).query(
      withErrorWrapping(async ({ ctx, input }) => {
        const svc = createTelephonyContentService(ctx.org.tenantDb);
        return svc.listSmsResponses(input.locale);
      }),
    ),

    createSmsResponse: adminProcedure
      .input(createSmsResponseInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = createTelephonyContentService(ctx.org.tenantDb);
          return svc.createSmsResponse(input);
        }),
      ),

    updateSmsResponse: adminProcedure
      .input(updateSmsResponseInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = createTelephonyContentService(ctx.org.tenantDb);
          return svc.updateSmsResponse(input.id, { text: input.text });
        }),
      ),

    deleteSmsResponse: adminProcedure
      .input(deleteSmsResponseInputSchema)
      .mutation(
        withErrorWrapping(async ({ ctx, input }) => {
          const svc = createTelephonyContentService(ctx.org.tenantDb);
          await svc.deleteSmsResponse(input.id);
          return { success: true as const };
        }),
      ),
  });
}
