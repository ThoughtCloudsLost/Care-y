<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { Page, Navbar, Block, List, ListInput, Button } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc";

  let identifier = $state("");
  let password = $state("");
  let error = $state("");
  let loading = $state(false);

  async function handleSubmit(e: SubmitEvent): Promise<void> {
    e.preventDefault();
    error = "";
    loading = true;

    try {
      await trpc.auth.login.mutate({ identifier, password });
      await goto(resolve("/"));
    } catch {
      error = m.auth_invalid_credentials();
    } finally {
      loading = false;
    }
  }
</script>

<Page>
  <Navbar title={m.auth_sign_in()} />

  <Block class="mt-8 text-center">
    <h1 class="text-2xl font-bold">CARE-Y</h1>
    <p class="mt-1 text-sm opacity-60">{m.auth_sign_in_continue()}</p>
  </Block>

  {#if error}
    <Block class="mt-2">
      <p role="alert" class="text-center text-red-600 text-sm">{error}</p>
    </Block>
  {/if}

  <form onsubmit={handleSubmit}>
    <List strong inset>
      <ListInput
        label={m.auth_username()}
        type="text"
        placeholder={m.auth_username_placeholder()}
        bind:value={identifier}
        autocomplete="username"
        autocapitalize="none"
        required
      />
      <ListInput
        label={m.auth_password()}
        type="password"
        placeholder={m.auth_password_placeholder()}
        bind:value={password}
        autocomplete="current-password"
        required
      />
    </List>

    <Block class="mt-4">
      <Button
        large
        type="submit"
        disabled={loading || !identifier || !password}
      >
        {loading ? m.auth_signing_in() : m.auth_sign_in()}
      </Button>
    </Block>
  </form>
</Page>
