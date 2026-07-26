<!--
  Production splash, rendered verbatim inside the device frame.

  The markup and every style block that targets #splash are extracted at
  runtime from the client's app.html (imported as raw text), so the demo
  cannot drift from what production paints before hydration. The client
  has no branding icons in the demo, which matches production's default:
  the logo img keeps opacity 0 and only the app name shows.

  Visibility reuses production's own dismissal rule (body.hydrated
  #splash fades out). The demo toggles that class instead of removing
  the element, so a restart brings the splash back with the same fade.
-->
<script lang="ts" module>
  import appHtmlRaw from "../../../client/src/app.html?raw";

  function extractSplash(): { markup: string; styles: string } {
    const doc = new DOMParser().parseFromString(appHtmlRaw, "text/html");
    const splash = doc.getElementById("splash");
    const styles = [...doc.querySelectorAll("style")]
      .map((style) => style.textContent)
      .filter((css) => css.includes("#splash"))
      .join("\n");
    return { markup: splash?.outerHTML ?? "", styles };
  }

  const { markup, styles } = extractSplash();
</script>

<script lang="ts">
  interface Props {
    /** True once a feature is active; fades the splash out. */
    dismissed: boolean;
  }

  let { dismissed }: Props = $props();

  $effect(() => {
    // Production's dismiss-splash.ts adds this class after hydration;
    // the splash CSS keys its fade on it.
    document.body.classList.toggle("hydrated", dismissed);
  });
</script>

<!-- eslint-disable svelte/no-at-html-tags -- markup and styles come from the repo's own app.html via a build-time ?raw import, never from user input -->
{@html `<style>${styles}</style>`}
{@html markup}
<!-- eslint-enable svelte/no-at-html-tags -->
