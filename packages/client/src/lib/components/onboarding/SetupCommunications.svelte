<!--
  SetupCommunications: consolidated communications step.

  Wraps the four admin communications sections (Telephony, Greetings,
  SMS Templates, Blocklist) in a collapsible accordion. All sections
  use per-item CRUD patterns and save independently via their own
  sheet UIs. The Continue button advances when telephony is configured.
  Skip is always available.
-->
<script lang="ts">
  import { SvelteSet } from "svelte/reactivity";
  import { Block, BlockTitle } from "konsta/svelte";
  import { Phone, Mic, MessageSquare, Ban } from "@lucide/svelte";
  import { createQuery } from "@tanstack/svelte-query";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { adminKeys } from "$lib/query/keys.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { requireRouter } from "$lib/errors.js";
  import CollapsibleSection from "$lib/components/dashboard/CollapsibleSection.svelte";
  import OnboardingCryptoBridge from "$lib/providers/OnboardingCryptoBridge.svelte";
  import TelephonyConfigSection from "$lib/components/admin/TelephonyConfigSection.svelte";
  import GreetingsSection from "$lib/components/admin/GreetingsSection.svelte";
  import SmsTemplatesSection from "$lib/components/admin/SmsTemplatesSection.svelte";
  import BlocklistSection from "$lib/components/admin/BlocklistSection.svelte";
  import { getWizardNavCtx } from "./wizard-nav-context.js";

  interface Props {
    adminUserId: string;
    oncomplete: (data: { telephonyMode: "byot" | "managed" | "skip" }) => void;
    goBack?: () => void;
  }

  let { adminUserId, oncomplete, goBack }: Props = $props();

  const wizardNav = getWizardNavCtx();

  const telephonyAdmin = requireRouter(trpc.telephonyAdmin, "telephonyAdmin");

  const configQuery = createQuery(() => ({
    queryKey: adminKeys.telephonyConfig(),
    queryFn: async () => telephonyAdmin.getConfig.query(),
  }));

  const isConfigured = $derived(configQuery.data != null);
  const configuredMode = $derived.by((): "byot" | "managed" => {
    const mode = configQuery.data?.mode;
    return mode === "byot" ? "byot" : "managed";
  });

  const collapsedSections = new SvelteSet<string>();

  function toggleSection(id: string): void {
    if (collapsedSections.has(id)) {
      collapsedSections.delete(id);
    } else {
      collapsedSections.add(id);
    }
  }

  function handleFinish(): void {
    haptic();
    oncomplete({ telephonyMode: isConfigured ? configuredMode : "skip" });
  }

  $effect(() => {
    wizardNav.current = {
      right: {
        label: isConfigured ? m.common_next() : m.ticket_close_skip(),
        disabled: false,
        loading: false,
        onaction: handleFinish,
      },
      left: goBack
        ? {
            label: m.common_back(),
            disabled: false,
            loading: false,
            onaction: goBack,
          }
        : undefined,
    };
  });
</script>

<BlockTitle medium>{m.onboarding_communications_heading()}</BlockTitle>
<Block>
  <p class="step-desc">{m.onboarding_communications_subtext()}</p>
</Block>

<OnboardingCryptoBridge {adminUserId}>
  <CollapsibleSection
    heading={m.admin_tab_telephony()}
    icon={Phone}
    iconColor="var(--brand-accent)"
    expanded={!collapsedSections.has("telephony")}
    ontoggle={() => toggleSection("telephony")}
  >
    <TelephonyConfigSection />
  </CollapsibleSection>

  <CollapsibleSection
    heading={m.admin_tab_greetings()}
    icon={Mic}
    iconColor="var(--brand-accent)"
    expanded={!collapsedSections.has("greetings")}
    ontoggle={() => toggleSection("greetings")}
  >
    <GreetingsSection />
  </CollapsibleSection>

  <CollapsibleSection
    heading={m.admin_tab_sms_templates()}
    icon={MessageSquare}
    iconColor="var(--brand-accent)"
    expanded={!collapsedSections.has("templates")}
    ontoggle={() => toggleSection("templates")}
  >
    <SmsTemplatesSection />
  </CollapsibleSection>

  <CollapsibleSection
    heading={m.admin_tab_blocklist()}
    icon={Ban}
    iconColor="var(--brand-accent)"
    expanded={!collapsedSections.has("blocklist")}
    ontoggle={() => toggleSection("blocklist")}
  >
    <BlocklistSection />
  </CollapsibleSection>
</OnboardingCryptoBridge>
