<!--
  Route-mount scene for the login feature.

  Renders the REAL (auth)/login/+page.svelte wrapped in the real
  (auth)/+layout.svelte. Prefills identifier/password fields by
  dispatching input events into the mounted Konsta ListInput elements.

  Login stage transitions are tracked via the login-stage module
  and the login-crypto stage listener.
-->
<script lang="ts">
  import AuthLayout from "$routes/(auth)/+layout.svelte";
  import LoginPage from "$routes/(auth)/login/+page.svelte";
  import { setLoginStage } from "$demo/login-stage.svelte.js";
  import { maskPasswordControls } from "$demo/password-mask.js";
  import { setLoginCryptoStageListener } from "../../stubs/login-crypto.js";

  // Prefill credentials after the form mounts. Uses input events so
  // Svelte's bind:value picks up the change (setting .value alone
  // does not trigger the rune reactivity).
  function prefillField(selector: string, value: string, root: Element): void {
    const input = root.querySelector<HTMLInputElement>(selector);
    if (input === null) return;
    // Konsta ListInput wraps <input> inside nested divs. The input
    // itself is the element that carries bind:value.
    const nativeInput =
      input.tagName === "INPUT"
        ? input
        : input.querySelector<HTMLInputElement>("input");
    if (nativeInput === null) return;

    // Set the value property and dispatch an input event so Svelte
    // picks up the change via its event-based reactivity.
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set?.call(nativeInput, value);
    nativeInput.dispatchEvent(new Event("input", { bubbles: true }));
  }

  // Observe the DOM for stage-bearing elements. One persistent observer:
  // the form re-creates on locale change ({#key} blocks) and on
  // back-from-2FA, so a disconnect-after-first-hit observer would miss
  // re-prefill. Every detection keys on a selector unique to one screen;
  // no structural heuristics (an h1/list-count sniff misfired on the
  // credentials form and stamped a 2FA stage at load).
  let containerEl: HTMLElement | undefined = $state();

  /** Mark the mounted form as autocomplete-off and convert the
   *  password control to a masked text control. Chrome provisionally
   *  saves credentials while they are typed, so the submit-capture
   *  clearing below is not sufficient on its own; the mask keeps a
   *  type="password" field out of the document entirely.
   *  Demo-document attributes only; product source untouched. */
  function suppressAutofill(container: Element): void {
    const form = container.querySelector("form");
    form?.setAttribute("autocomplete", "off");
    container
      .querySelector<HTMLInputElement>('input[autocomplete="current-password"]')
      ?.setAttribute("autocomplete", "off");
    maskPasswordControls(container);
  }

  $effect(() => {
    const container = containerEl;
    if (container === undefined) return;

    function scan(): void {
      if (container === undefined) return;

      // Credentials form: unique username field. Present only while the
      // page is at the sign-in phase (initial, locale switch, or back
      // from the 2FA challenge), so its presence is the "form" signal.
      const username = container.querySelector<HTMLInputElement>(
        'input[autocomplete="username"]',
      );
      if (username !== null) {
        setLoginStage("form");
        if (username.value === "") {
          prefillField('input[autocomplete="username"]', "jdoe", container);
          prefillField(
            'input[autocomplete="current-password"]',
            "DemoPassword2026",
            container,
          );
        }
        suppressAutofill(container);
      }

      // Code-based 2FA methods (totp/email/sms) render a one-time-code
      // input; the backup form is the only maxlength-20 field. Either
      // appearing means a specific method is open.
      const otc = container.querySelector<HTMLInputElement>(
        'input[autocomplete="one-time-code"]',
      );
      if (otc !== null) {
        setLoginStage("twofa-method");
        if (otc.value === "") {
          prefillField(
            'input[autocomplete="one-time-code"]',
            "123456",
            container,
          );
        }
      }

      const backup = container.querySelector<HTMLInputElement>(
        'input[maxlength="20"]',
      );
      if (backup !== null) {
        setLoginStage("twofa-method");
        if (backup.value === "") {
          prefillField('input[maxlength="20"]', "DEMO-BACKUP-1234", container);
        }
      }
    }

    scan();
    const observer = new MutationObserver(scan);
    observer.observe(container, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  });

  // The browser offers to save credentials when a form submits with a
  // filled password control. The page reads credentials from bound
  // state, never the DOM, so clearing the DOM value in the capture
  // phase hides it from the save-password snapshot without affecting
  // sign-in. No input event is dispatched, so the bound state keeps
  // the value. The form unmounts right after submit (phase change).
  $effect(() => {
    const container = containerEl;
    if (container === undefined) return;

    function clearPasswordControl(ev: SubmitEvent): void {
      const target = ev.target;
      if (!(target instanceof HTMLElement)) return;
      const pw = target.querySelector<HTMLInputElement>(
        'input[type="password"]',
      );
      if (pw === null) return;
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )?.set?.call(pw, "");
    }

    container.addEventListener("submit", clearPasswordControl, {
      capture: true,
    });
    return () => {
      container.removeEventListener("submit", clearPasswordControl, {
        capture: true,
      });
    };
  });

  // Listen for login-crypto stage transitions to update login stage
  $effect(() => {
    setLoginCryptoStageListener((cryptoStage: string) => {
      if (
        cryptoStage === "argon2id" ||
        cryptoStage === "oprf" ||
        cryptoStage === "derive"
      ) {
        setLoginStage("deriving");
      } else if (cryptoStage === "done") {
        // The login page will navigate to "/" next, which the router
        // maps to tickets. Stage will be set to null by PhoneApp.
      }
    });

    return () => {
      setLoginCryptoStageListener(null);
    };
  });
</script>

<div class="login-mount" bind:this={containerEl}>
  <AuthLayout>
    <LoginPage />
  </AuthLayout>
</div>

<style>
  .login-mount {
    height: 100%;
  }
</style>
