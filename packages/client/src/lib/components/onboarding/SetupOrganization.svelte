<!--
  SetupOrganization: consolidated org identity step.

  Wraps five admin organization sections: OrgGeneral (always visible),
  Branding, Terminology, Retention, and NoteTypes (in collapsible
  accordion). OrgGeneral is required (org name must be non-empty).
  The other sections are optional and save via their own sheet UIs.
  Continue calls save() on OrgGeneral, then advances the wizard.
-->
<script lang="ts">
  import { SvelteSet } from "svelte/reactivity";
  import { getContext } from "svelte";
  import { Block, BlockTitle } from "konsta/svelte";
  import {
    Palette,
    Languages,
    Shredder,
    ClipboardPenLine,
  } from "@lucide/svelte";
  import type { TerminologyLabels } from "@care-y/shared";
  import { TERMINOLOGY_DEFAULTS_EN } from "@care-y/shared";
  import * as m from "$lib/paraglide/messages.js";
  import { readCachedTerminology } from "$lib/terminology/index.js";
  import CollapsibleSection from "$lib/components/dashboard/CollapsibleSection.svelte";
  import { getWizardNavCtx } from "./wizard-nav-context.js";
  import OnboardingCryptoBridge from "$lib/providers/OnboardingCryptoBridge.svelte";
  import OrgGeneralSection from "$lib/components/admin/OrgGeneralSection.svelte";
  import BrandingSection from "$lib/components/admin/BrandingSection.svelte";
  import TerminologySection from "$lib/components/admin/TerminologySection.svelte";
  import RetentionSection from "$lib/components/admin/RetentionSection.svelte";
  import NoteTypesSection from "$lib/components/admin/NoteTypesSection.svelte";
  import { haptic } from "$lib/utils/haptic.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";

  interface Props {
    adminUserId: string;
    oncomplete: () => void;
    goBack?: () => void;
  }

  let { adminUserId, oncomplete, goBack }: Props = $props();

  const wizardNav = getWizardNavCtx();

  const updateTerminology =
    getContext<((labels: TerminologyLabels) => void) | undefined>(
      "onboarding-update-terminology",
    ) ?? undefined;

  let saving = $state(false);

  let orgGeneralRef = $state<OrgGeneralSection>();
  let brandingRef = $state<BrandingSection>();
  let terminologyRef = $state<TerminologySection>();
  let retentionRef = $state<RetentionSection>();

  const collapsedSections = new SvelteSet<string>();

  function toggleSection(id: string): void {
    if (collapsedSections.has(id)) {
      collapsedSections.delete(id);
    } else {
      collapsedSections.add(id);
    }
  }

  /* eslint-disable @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/no-unnecessary-condition -- bind:this refs are typed as any by Svelte */
  const canContinue = $derived.by((): boolean => {
    return (orgGeneralRef?.hasOrgName() as boolean) ?? false;
  });

  async function handleContinue(): Promise<void> {
    saving = true;
    try {
      if (orgGeneralRef?.isDirty()) {
        await orgGeneralRef.save();
      }
      if (brandingRef?.isDirty()) {
        await brandingRef.save();
      }
      if (terminologyRef?.isDirty()) {
        await terminologyRef.save();
      }
      if (retentionRef?.isDirty()) {
        await retentionRef.save();
      }
      /* eslint-enable @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-unsafe-type-assertion, @typescript-eslint/no-unnecessary-condition */

      if (updateTerminology) {
        const cached = readCachedTerminology();
        const labels = cached?.en ?? TERMINOLOGY_DEFAULTS_EN;
        updateTerminology(labels);
      }

      haptic();
      oncomplete();
    } catch {
      announceToLiveRegion("assertive", m.admin_org_general_error());
    } finally {
      saving = false;
    }
  }

  $effect(() => {
    wizardNav.current = {
      right: {
        label: m.common_next(),
        disabled: saving || !canContinue,
        loading: saving,
        onaction: () => void handleContinue(),
      },
      left: goBack
        ? {
            label: m.common_back(),
            disabled: saving,
            loading: false,
            onaction: goBack,
          }
        : undefined,
    };
  });
</script>

<BlockTitle medium>{m.onboarding_organization_heading()}</BlockTitle>
<Block>
  <p class="step-desc">{m.onboarding_organization_subtext()}</p>
</Block>

<OnboardingCryptoBridge {adminUserId}>
  <OrgGeneralSection
    bind:this={orgGeneralRef}
    externalSave
    onnamechange={() => void brandingRef?.rebuildBlob()}
  />

  <CollapsibleSection
    heading={m.admin_tab_branding()}
    icon={Palette}
    iconColor="var(--brand-accent)"
    expanded={!collapsedSections.has("branding")}
    ontoggle={() => toggleSection("branding")}
  >
    <BrandingSection bind:this={brandingRef} externalSave />
  </CollapsibleSection>

  <CollapsibleSection
    heading={m.admin_tab_terminology()}
    icon={Languages}
    iconColor="var(--brand-accent)"
    expanded={!collapsedSections.has("terminology")}
    ontoggle={() => toggleSection("terminology")}
  >
    <TerminologySection bind:this={terminologyRef} externalSave />
  </CollapsibleSection>

  <CollapsibleSection
    heading={m.admin_tab_retention()}
    icon={Shredder}
    iconColor="var(--brand-accent)"
    expanded={!collapsedSections.has("retention")}
    ontoggle={() => toggleSection("retention")}
  >
    <RetentionSection bind:this={retentionRef} externalSave />
  </CollapsibleSection>

  <CollapsibleSection
    heading={m.admin_tab_note_types()}
    icon={ClipboardPenLine}
    iconColor="var(--brand-accent)"
    expanded={!collapsedSections.has("note-types")}
    ontoggle={() => toggleSection("note-types")}
  >
    <NoteTypesSection />
  </CollapsibleSection>
</OnboardingCryptoBridge>
