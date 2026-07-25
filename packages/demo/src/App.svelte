<!--
  Demo site shell: scene picker, light/dark toggle, caption bar with
  step dots, and restart button. Single column on small viewports.
-->
<script lang="ts">
  import * as m from "$lib/paraglide/messages.js";
  import { Segmented, SegmentedButton, Button } from "konsta/svelte";
  import { RotateCcw, Sun, Moon } from "@lucide/svelte";
  import DemoSurface from "$demo/DemoSurface.svelte";
  import TicketsFlowDemo from "$demo/flows/TicketsFlowDemo.svelte";
  import SearchFlowDemo from "$demo/flows/SearchFlowDemo.svelte";
  import type { DemoScript } from "$demo/engine/script.svelte.js";

  type Scene = "tickets" | "search";

  let scene: Scene = $state("tickets");
  let dark = $state(false);

  let scriptHandle: DemoScript | undefined = $state(undefined);

  // $derived.by closures: at the top level TS narrows scriptHandle to its
  // initializer (undefined) because the bind: assignment is invisible to
  // control-flow analysis; inside a closure the declared type applies.
  const caption = $derived.by(() => scriptHandle?.current.caption() ?? "");
  const stepIndex = $derived.by(() => scriptHandle?.index ?? 0);
  const stepTotal = $derived.by(() => scriptHandle?.steps.length ?? 0);
  const stepLabel = $derived(
    stepTotal > 0
      ? m.demo_step_of({
          step: String(stepIndex + 1),
          total: String(stepTotal),
        })
      : "",
  );

  function handleRestart(): void {
    scriptHandle?.restart();
  }

  function handleSceneChange(next: Scene): void {
    if (next === scene) return;
    scriptHandle = undefined;
    scene = next;
  }
</script>

<div class="demo-page">
  <header class="demo-header">
    <h1 class="demo-title">{m.demo_app_title()}</h1>

    <div class="demo-controls">
      <Segmented strong>
        <SegmentedButton
          active={scene === "tickets"}
          onclick={() => handleSceneChange("tickets")}
        >
          {m.demo_scene_tickets()}
        </SegmentedButton>
        <SegmentedButton
          active={scene === "search"}
          onclick={() => handleSceneChange("search")}
        >
          {m.demo_scene_search()}
        </SegmentedButton>
      </Segmented>

      <button
        class="theme-toggle"
        onclick={() => (dark = !dark)}
        aria-label={m.demo_theme_toggle()}
        type="button"
      >
        {#if dark}
          <Sun size={20} />
        {:else}
          <Moon size={20} />
        {/if}
      </button>
    </div>
  </header>

  <div class="demo-stage">
    <DemoSurface {dark} bind:script={scriptHandle}>
      {#if scene === "tickets"}
        <TicketsFlowDemo bind:script={scriptHandle} />
      {:else}
        <SearchFlowDemo bind:script={scriptHandle} />
      {/if}
    </DemoSurface>
  </div>

  <footer class="demo-caption-bar">
    <div class="caption-text">
      {#if caption}
        <span class="caption-label">{caption}</span>
      {:else}
        <span class="caption-hint">{m.demo_tap_hint()}</span>
      {/if}
    </div>

    <div class="caption-controls">
      {#if stepTotal > 0}
        <div class="step-dots" aria-label={stepLabel}>
          {#each { length: stepTotal } as _, i (i)}
            <span class="dot" class:active={i === stepIndex} aria-hidden="true"
            ></span>
          {/each}
          <span class="sr-only">{stepLabel}</span>
        </div>
      {/if}

      <Button
        small
        clear
        onclick={handleRestart}
        disabled={!scriptHandle}
        aria-label={m.demo_restart()}
      >
        <RotateCcw size={16} />
      </Button>
    </div>
  </footer>
</div>

<style>
  .demo-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100vh;
    padding: 1.5rem;
    gap: 1rem;
    font-family:
      system-ui,
      -apple-system,
      sans-serif;
    background: #f5f5f7;
    color: #1d1d1f;
  }

  .demo-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    max-width: 500px;
  }

  .demo-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
  }

  .demo-controls {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
  }

  .demo-controls :global(.k-segmented) {
    flex: 1;
  }

  .theme-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 1px solid #d1d1d6;
    background: white;
    cursor: pointer;
    color: #1d1d1f;
    flex-shrink: 0;
  }

  .theme-toggle:hover {
    background: #f0f0f0;
  }

  .demo-stage {
    width: 100%;
    max-width: 500px;
    /* Give the frame enough vertical space.
       On small screens the ResizeObserver will scale down. */
    aspect-ratio: 414 / 868;
    max-height: calc(100vh - 200px);
  }

  .demo-caption-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    max-width: 500px;
    gap: 0.5rem;
    padding: 0.5rem 0;
  }

  .caption-text {
    flex: 1;
    min-width: 0;
  }

  .caption-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #1d1d1f;
  }

  .caption-hint {
    font-size: 0.875rem;
    color: #86868b;
  }

  .caption-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .step-dots {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #d1d1d6;
    transition: background 0.2s;
  }

  .dot.active {
    background: #007aff;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
</style>
