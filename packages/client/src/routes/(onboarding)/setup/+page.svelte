<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import {
    Block,
    BlockTitle,
    Button,
    Link,
    List,
    ListInput,
  } from "konsta/svelte";
  import * as m from "$lib/paraglide/messages.js";

  let token = $state("");

  function goToSetup(): void {
    const trimmed = token.trim();
    if (trimmed.length === 0) return;
    void goto(resolve(`/setup/${trimmed}`));
  }
</script>

<BlockTitle medium>{m.onboarding_setup_error()}</BlockTitle>
<Block>
  <p class="step-desc">
    {m.onboarding_setup_invalid_link()}
  </p>
</Block>
<BlockTitle>{m.onboarding_setup_have_token()}</BlockTitle>
<List inset strong>
  <ListInput
    type="text"
    autocapitalize="none"
    autocorrect="off"
    spellcheck="false"
    label={m.onboarding_setup_token_label()}
    placeholder={m.onboarding_setup_token_placeholder()}
    value={token}
    onInput={(e: Event) => {
      const target = e.target;
      if (target instanceof HTMLInputElement) token = target.value;
    }}
  />
</List>
<Block>
  <Button large onclick={goToSetup} disabled={token.trim().length === 0}>
    {m.onboarding_setup_go_to_setup()}
  </Button>
  <div class="home-link">
    <Link onclick={() => void goto(resolve("/"))}>{m.common_go_home()}</Link>
  </div>
</Block>

<style>
  .home-link {
    display: flex;
    justify-content: center;
    margin-top: 0.75rem;
  }
</style>
