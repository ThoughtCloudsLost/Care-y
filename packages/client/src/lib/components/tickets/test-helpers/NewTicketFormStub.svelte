<!--
  Test-only stub for NewTicketForm. Renders one button per lookup and
  shows what came back: the JSON of a successful result, the message of
  a LookupFailedError, or "unexpected" for any other rejection. Used by
  NewTicketController tests to drive the two lookups without the form.
-->
<script lang="ts">
  import { LookupFailedError } from "$lib/errors.js";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";

  interface Props {
    resolveCreateTarget: (clientId: string) => Promise<{
      openTicketId: string | null;
      reopenTicketId: string | null;
    }>;
    fetchQueueMemberKeys: (
      queueId: string,
    ) => Promise<readonly { volunteerId: string; volPublic: string }[]>;
    [key: string]: unknown;
  }

  let { resolveCreateTarget, fetchQueueMemberKeys, ..._rest }: Props = $props();

  let result = $state("");
  let error = $state("");

  async function run(call: () => Promise<unknown>): Promise<void> {
    try {
      result = JSON.stringify(await call());
    } catch (err: unknown) {
      error = err instanceof LookupFailedError ? err.message : "unexpected";
    }
  }
</script>

<button
  type="button"
  data-testid="stub-resolve"
  aria-label={m.ticket_new_submit(withTerms())}
  onclick={() => void run(async () => resolveCreateTarget("client-1"))}
></button>
<button
  type="button"
  data-testid="stub-keys"
  aria-label={m.ticket_new_submit(withTerms())}
  onclick={() => void run(async () => fetchQueueMemberKeys("q1"))}
></button>
<p data-testid="stub-result">{result}</p>
<p data-testid="stub-error">{error}</p>
