<!--
  Shared error state for invalid, revoked, expired, or incomplete
  client-facing links. Used by both the Secure Link portal and the
  one-time share view so the error anatomy is consistent: title + body
  inside a Konsta Block, matching the portal's established pattern.
-->
<script lang="ts">
  import { Block, BlockTitle } from "konsta/svelte";

  interface Props {
    /** Heading shown above the body text. */
    readonly title: string;
    /** Descriptive body copy explaining the error. */
    readonly body: string;
    /** Optional data-testid on the outer wrapper. */
    readonly testId?: string;
  }

  let { title, body, testId }: Props = $props();
</script>

<div data-testid={testId}>
  <BlockTitle>{title}</BlockTitle>
  <Block>
    <p class="link-error-body">{body}</p>
  </Block>
</div>

<style>
  .link-error-body {
    font-size: var(--text-sm);
    color: var(--muted);
    line-height: 1.6;
  }
</style>
