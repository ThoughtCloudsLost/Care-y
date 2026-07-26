<script lang="ts">
  import { Permission } from "@care-y/shared";
  import { Phone, Ban, Mic, MessageSquare, ShieldAlert } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import CollapsibleSectionPage from "$lib/components/admin/CollapsibleSectionPage.svelte";
  import type { SectionDef } from "$lib/components/admin/collapsible-section-types.js";
  import TelephonyConfigSection from "$lib/components/admin/TelephonyConfigSection.svelte";
  import BlocklistSection from "$lib/components/admin/BlocklistSection.svelte";
  import GreetingsSection from "$lib/components/admin/GreetingsSection.svelte";
  import SmsTemplatesSection from "$lib/components/admin/SmsTemplatesSection.svelte";
  import QuarantineSection from "$lib/components/admin/QuarantineSection.svelte";

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
      icon: ShieldAlert,
      permission: Permission.MANAGE_INFRASTRUCTURE,
      component: QuarantineSection,
    },
  ];
</script>

<CollapsibleSectionPage sections={SECTIONS} title={m.admin_comms_title()} />
