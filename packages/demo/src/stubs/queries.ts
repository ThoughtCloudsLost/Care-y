/**
 * Stub for $lib/tickets/queries.
 *
 * Prevents @tanstack/svelte-query from entering the demo bundle.
 * TicketPreview optional-chains before calling createNoteTypesQuery,
 * so it never executes in practice. If called, it throws to surface
 * an unexpected code path rather than silently returning garbage.
 */

class DemoStubError extends Error {
  override readonly name = "DemoStubError";
  constructor(fnName: string) {
    super(
      `${fnName} is stubbed out in the demo: tanstack queries are not available`,
    );
  }
}

/**
 * Structural mirror of the note-types query result surface TicketPreview
 * reads (data.defaultNoteTypeId, data.types[].id/encryptedIcon/encryptedName).
 * Returning `never` would break typechecking at those property reads.
 */
export interface DemoNoteTypesQuery {
  readonly data:
    | {
        readonly defaultNoteTypeId: string | null;
        readonly types: readonly {
          readonly id: string;
          readonly encryptedIcon: unknown;
          readonly encryptedName: unknown;
        }[];
      }
    | undefined;
}

export function createNoteTypesQuery(_router: unknown): DemoNoteTypesQuery {
  throw new DemoStubError("createNoteTypesQuery");
}

export function createVolunteersQuery(_router: unknown): never {
  throw new DemoStubError("createVolunteersQuery");
}

export function createParticipantsQuery(
  _router: unknown,
  _ticketId: unknown,
): never {
  throw new DemoStubError("createParticipantsQuery");
}

export function createCountsQuery(_router: unknown): never {
  throw new DemoStubError("createCountsQuery");
}

export function createAllNoteTypesQuery(_router: unknown): never {
  throw new DemoStubError("createAllNoteTypesQuery");
}
