<script lang="ts">
  /**
   * Glyph for a value's classification, the second identity channel
   * beside the kind's word. Written as a switch rather than a lookup
   * table so the icon set is exhaustive over FlowValueKind at compile
   * time, matching FlowBandLaneIcon.
   *
   * Icons, not text glyphs: these sit on the same row as the lane icon,
   * so anything that renders through a different system would land on a
   * different baseline at a different optical weight. Icons also inherit
   * currentColor and stroke width, which keeps a kind marker reading as
   * an instrument rather than as punctuation.
   *
   * None of the five collide with a lane icon. Ciphertext is Binary
   * rather than a lock, because Lock is the crypto lane.
   */

  import { Binary, FileText, KeyRound, Hash, Info } from "@lucide/svelte";
  import type { FlowValueKind } from "./bridge.js";

  interface Props {
    kind: FlowValueKind;
    size?: number;
  }

  let { kind, size = 12 }: Props = $props();
</script>

{#if kind === "ciphertext"}
  <Binary {size} />
{:else if kind === "plaintext"}
  <FileText {size} />
{:else if kind === "key-material"}
  <KeyRound {size} />
{:else if kind === "identifier"}
  <Hash {size} />
{:else}
  <Info {size} />
{/if}
