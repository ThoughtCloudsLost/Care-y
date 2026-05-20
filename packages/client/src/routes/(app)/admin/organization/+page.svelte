<script lang="ts">
  import { Permission } from "@care-y/shared";
  import {
    Building2,
    Key,
    Palette,
    Shredder,
    ClipboardPenLine,
    Languages,
  } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import CollapsibleSectionPage from "$lib/components/admin/CollapsibleSectionPage.svelte";
  import type { SectionDef } from "$lib/components/admin/collapsible-section-types.js";
  import OrgBasicsSection from "$lib/components/admin/OrgBasicsSection.svelte";
  import KeysSection from "$lib/components/admin/KeysSection.svelte";
  import BrandingSection from "$lib/components/admin/BrandingSection.svelte";
  import RetentionSection from "$lib/components/admin/RetentionSection.svelte";
  import NoteTypesSection from "$lib/components/admin/NoteTypesSection.svelte";
  import TerminologySection from "$lib/components/admin/TerminologySection.svelte";

  const SECTIONS: readonly SectionDef[] = [
    {
      id: "basics",
      label: m.admin_tab_org_basics,
      icon: Building2,
      permission: Permission.MANAGE_ORG_CONFIG,
      component: OrgBasicsSection,
    },
    {
      id: "branding",
      label: m.admin_tab_branding,
      icon: Palette,
      permission: Permission.MANAGE_ORG_CONFIG,
      component: BrandingSection,
    },
    {
      id: "terminology",
      label: m.admin_tab_terminology,
      icon: Languages,
      permission: Permission.MANAGE_ORG_CONFIG,
      component: TerminologySection,
    },
    {
      id: "keys",
      label: m.admin_tab_keys,
      icon: Key,
      permission: Permission.MANAGE_KEYS,
      component: KeysSection,
    },
    {
      id: "retention",
      label: m.admin_tab_retention,
      icon: Shredder,
      permission: Permission.MANAGE_ORG_CONFIG,
      component: RetentionSection,
    },
    {
      id: "note-types",
      label: m.admin_tab_note_types,
      icon: ClipboardPenLine,
      permission: Permission.MANAGE_ORG_CONFIG,
      component: NoteTypesSection,
    },
  ];
</script>

<CollapsibleSectionPage sections={SECTIONS} title={m.admin_org_title()} />
