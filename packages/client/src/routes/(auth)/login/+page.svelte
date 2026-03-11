<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { Page, Navbar, Block, List, ListInput, Button } from "konsta/svelte";
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
      error = "Invalid username or password";
    } finally {
      loading = false;
    }
  }
</script>

<Page>
  <Navbar title="Sign in" />

  <Block class="mt-8 text-center">
    <h1 class="text-2xl font-bold">CARE-Y</h1>
    <p class="mt-1 text-sm opacity-60">Sign in to continue</p>
  </Block>

  {#if error}
    <Block class="mt-2">
      <p role="alert" class="text-center text-red-600 text-sm">{error}</p>
    </Block>
  {/if}

  <form onsubmit={handleSubmit}>
    <List strong inset>
      <ListInput
        label="Username"
        type="text"
        placeholder="your.username"
        bind:value={identifier}
        autocomplete="username"
        autocapitalize="none"
        required
      />
      <ListInput
        label="Password"
        type="password"
        placeholder="Enter your password"
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
        {loading ? "Signing in..." : "Sign in"}
      </Button>
    </Block>
  </form>
</Page>
