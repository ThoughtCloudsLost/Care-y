<!--
  Dismissal control for the production splash.

  The splash markup and styles are injected into phone.html at serve/
  build time by demoSplashPlugin (vite.ts), extracted from the client's
  app.html so the demo cannot drift from what production paints before
  hydration. Static markup paints immediately, exactly like production;
  a component-rendered splash would leave the iframe white until the
  whole module graph loads.

  This component only mirrors production's dismiss-splash.ts: it toggles
  body.hydrated, which the splash CSS keys its fade on. Toggling the
  class instead of removing the element lets a restart bring the splash
  back with the same fade.
-->
<script lang="ts">
  interface Props {
    /** True once a feature is active; fades the splash out. */
    dismissed: boolean;
  }

  let { dismissed }: Props = $props();

  $effect(() => {
    document.body.classList.toggle("hydrated", dismissed);
  });
</script>
