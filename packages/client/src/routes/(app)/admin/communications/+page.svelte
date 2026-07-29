<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { Permission } from "@care-y/shared";
  import { Phone, Ban, Mic, MessageSquare, PhoneMissed } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { getCurrentPermissions } from "$lib/crypto/context.js";
  import CollapsibleSectionPage from "$lib/components/admin/CollapsibleSectionPage.svelte";
  import type { SectionDef } from "$lib/components/admin/collapsible-section-types.js";
  import TelephonyConfigSection from "$lib/components/admin/TelephonyConfigSection.svelte";
  import BlocklistSection from "$lib/components/admin/BlocklistSection.svelte";
  import GreetingsSection from "$lib/components/admin/GreetingsSection.svelte";
  import SmsTemplatesSection from "$lib/components/admin/SmsTemplatesSection.svelte";
  import QuarantineSection from "$lib/components/admin/QuarantineSection.svelte";

  const permissionsGetter = getCurrentPermissions();
  const permissions = $derived(permissionsGetter());

  const SECTIONS: readonly SectionDef[] = [
    {
      id: "telephony",
      label: m.admin_tab_telephony,
      icon: Phone,
      permission: Permission.MANAGE_INFRASTRUCTURE,
      component: TelephonyConfigSection,
    },
    {
      id: "greetings",
      label: m.admin_tab_greetings,
      icon: Mic,
      permission: Permission.MANAGE_INFRASTRUCTURE,
      component: GreetingsSection,
    },
    {
      id: "templates",
      label: m.admin_tab_sms_templates,
      icon: MessageSquare,
      permission: Permission.MANAGE_INFRASTRUCTURE,
      component: SmsTemplatesSection,
    },
    {
      id: "blocklist",
      label: m.admin_tab_blocklist,
      icon: Ban,
      permission: Permission.MANAGE_INFRASTRUCTURE,
      component: BlocklistSection,
    },
    {
      id: "quarantine",
      label: m.admin_tab_quarantine,
      icon: PhoneMissed,
      permission: Permission.MANAGE_INFRASTRUCTURE,
      component: QuarantineSection,
    },
  ];

  const hasAccess = $derived(
    SECTIONS.some((s) => permissions.has(s.permission)),
  );

  $effect(() => {
    if (!hasAccess) void goto(resolve("/"));
  });
</script>

{#if hasAccess}
  <CollapsibleSectionPage sections={SECTIONS} title={m.admin_comms_title()} />
{/if}
