<!--
  Intake form editor page. The forms list lives in the organization admin
  page (Intake Forms section); this route hosts only the editor. `?id=<uuid>`
  edits an existing form, no query param creates a new one. Back and delete
  return to the organization section.

  Wires the unsaved-changes navigation guard. The editor emits dirty state;
  the route page owns the discard dialog and beforeNavigate interception.
-->
<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { Block, DialogButton, Link } from "konsta/svelte";
  import { ChevronLeft } from "@lucide/svelte";
  import {
    intakeFieldTypeSchema,
    intakeFieldRoleSchema,
    type IntakeFieldConfig,
    type IntakeFieldType,
    type IntakeFieldRole,
    type IntakeFormMeta,
    type LocalizedText,
  } from "@care-y/shared";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { requireRouter } from "$lib/errors.js";
  import { getOrgKeyManager } from "$lib/crypto/context.js";
  import { getNavbarOverrideCtx } from "$lib/shell/context.js";
  import {
    decryptFieldContent,
    decryptFormMeta,
  } from "$lib/portal/intake-form-crypto.js";
  import { useNavigationGuard } from "$lib/editor/use-navigation-guard.svelte.js";
  import { shellBack } from "$lib/shell/navigation.js";
  import ShellDialog from "$lib/shell/ShellDialog.svelte";
  import IntakeFormEditor from "$lib/components/admin/IntakeFormEditor.svelte";

  interface PlaintextField {
    fieldKey: string;
    label: LocalizedText;
    helpText: LocalizedText;
    isRequired: boolean;
    config: IntakeFieldConfig;
    fieldType: IntakeFieldType;
    role: IntakeFieldRole | null;
    routingQueueIds: string[] | null;
    escalationRecipientIds: string[] | null;
  }

  type ViewState =
    | { kind: "loading" }
    | { kind: "load-error"; message: string }
    | {
        kind: "editor";
        formId: string | null;
        formName: string;
        slug: string | null;
        isDefault: boolean;
        destinationQueueId: string | null;
        formMeta: IntakeFormMeta;
        closesAt: string | null;
        fields: PlaintextField[];
      };

  let view = $state<ViewState>({ kind: "loading" });
  let editorDirty = $state(false);

  const intakeFormsRouter = requireRouter(trpc.intakeForms, "intakeForms");
  const orgKeyManager = getOrgKeyManager();
  const navbarCtx = getNavbarOverrideCtx();

  const formId = $derived(page.url.searchParams.get("id"));
  const listPath = `${resolve("/admin/organization")}?tab=intake-forms`;

  // Navigation guard for unsaved changes
  const guard = useNavigationGuard({
    isDirty: () => editorDirty,
    fallbackUrl: listPath,
  });

  function handleDirtyChange(dirty: boolean): void {
    editorDirty = dirty;
  }

  async function loadFormForEditing(id: string): Promise<void> {
    const orgPub = orgKeyManager.getPublicKey();
    if (!orgPub) {
      view = { kind: "load-error", message: m.error_generic() };
      return;
    }

    try {
      const formDetail = await intakeFormsRouter.get.query({ formId: id });

      const decryptedFields: PlaintextField[] = formDetail.fields.map(
        (field: {
          fieldKey: string;
          encryptedLabel: string;
          encryptedConfig: string;
          isRequired: boolean;
          fieldType: string;
          role: string | null;
          routingQueueIds: readonly string[] | null;
          escalationRecipientIds: readonly string[] | null;
        }) => {
          const decrypted = decryptFieldContent(
            {
              encryptedLabel: field.encryptedLabel,
              encryptedConfig: field.encryptedConfig,
            },
            orgPub,
          );
          // Preserve full LocalizedText objects for multilingual editing
          const helpTextLocalized: LocalizedText =
            decrypted.config.helpText != null
              ? { ...decrypted.config.helpText }
              : {};
          return {
            fieldKey: field.fieldKey,
            label: { ...decrypted.label },
            helpText: helpTextLocalized,
            isRequired: field.isRequired,
            config: decrypted.config,
            fieldType: intakeFieldTypeSchema.parse(field.fieldType),
            role:
              field.role != null
                ? intakeFieldRoleSchema.parse(field.role)
                : null,
            routingQueueIds:
              field.routingQueueIds != null ? [...field.routingQueueIds] : null,
            escalationRecipientIds:
              field.escalationRecipientIds != null
                ? [...field.escalationRecipientIds]
                : null,
          };
        },
      );

      // Decrypt form-level metadata (string | null from the server).
      // Null means no metadata was saved; fall back to empty meta.
      let formMeta: IntakeFormMeta = {};
      const metaBlob = formDetail.encryptedFormMeta;
      if (metaBlob != null && metaBlob.length > 0) {
        try {
          formMeta = decryptFormMeta(metaBlob, orgPub);
        } catch {
          // Non-fatal: editor works without metadata
        }
      }

      view = {
        kind: "editor",
        formId: id,
        formName: formDetail.name,
        slug: formDetail.slug ?? null,
        isDefault: formDetail.isDefault,
        destinationQueueId: formDetail.destinationQueueId ?? null,
        formMeta,
        closesAt: formDetail.closesAt ?? null,
        fields: decryptedFields,
      };
    } catch {
      view = { kind: "load-error", message: m.error_generic() };
    }
  }

  function backToList(): void {
    guard.allowNavigation();
    // eslint-disable-next-line svelte/no-navigation-without-resolve -- listPath is built from resolve() above
    void goto(listPath);
  }

  /**
   * Cancel control: routes through shellBack so the navigation guard
   * intercepts when the editor is dirty (shows the discard dialog) and
   * navigates immediately when clean. Mirrors the library article
   * editor's Cancel pattern.
   */
  function handleCancel(): void {
    shellBack("/admin/organization");
  }

  $effect(() => {
    const id = formId;
    if (id === null) {
      view = {
        kind: "editor",
        formId: null,
        formName: "",
        slug: null,
        isDefault: false,
        destinationQueueId: null,
        formMeta: {},
        closesAt: null,
        fields: [],
      };
    } else {
      view = { kind: "loading" };
      void loadFormForEditing(id);
    }
  });

  $effect(() => {
    if (view.kind === "loading" || view.kind === "load-error") {
      navbarCtx.current = {
        left: navLeft,
        title: m.intake_forms_edit_title(),
      };
    } else {
      navbarCtx.current = {
        left: navLeft,
        title:
          view.formId !== null
            ? m.intake_forms_edit_title()
            : m.intake_forms_create_title(),
      };
    }
  });
</script>

{#snippet navLeft()}
  <Link
    iconOnly
    onclick={handleCancel}
    role="button"
    aria-label={m.common_cancel()}
  >
    <ChevronLeft size={22} aria-hidden="true" />
  </Link>
{/snippet}

{#if view.kind === "loading"}
  <Block>
    <p>{m.common_loading()}</p>
  </Block>
{:else if view.kind === "load-error"}
  <Block>
    <p class="load-error">{view.message}</p>
    <button type="button" class="back-link" onclick={backToList}>
      {m.common_cancel()}
    </button>
  </Block>
{:else}
  <IntakeFormEditor
    formId={view.formId}
    initialName={view.formName}
    initialSlug={view.slug}
    initialIsDefault={view.isDefault}
    initialDestinationQueueId={view.destinationQueueId}
    initialFormMeta={view.formMeta}
    initialClosesAt={view.closesAt}
    initialFields={view.fields}
    onback={backToList}
    ondeleted={backToList}
    ondirtychange={handleDirtyChange}
  />
{/if}

<!-- Discard unsaved changes dialog -->
<ShellDialog
  opened={guard.discardDialogOpen}
  ondismiss={() => guard.dismiss()}
  title={m.intake_forms_discard_title()}
>
  {#snippet content()}
    <p>{m.intake_forms_discard_confirm()}</p>
  {/snippet}
  {#snippet buttons()}
    <DialogButton onclick={() => guard.dismiss()}>
      {m.common_cancel()}
    </DialogButton>
    <DialogButton strong onclick={() => guard.confirmDiscard()}>
      {m.intake_forms_discard_action()}
    </DialogButton>
  {/snippet}
</ShellDialog>

<style>
  .load-error {
    color: var(--danger);
    text-align: center;
    padding: var(--space-lg) 0;
  }

  .back-link {
    display: block;
    margin: var(--space-md) auto 0;
    background: none;
    border: none;
    color: var(--brand-primary, var(--ink));
    cursor: pointer;
    font-size: var(--text-base);
    text-decoration: underline;
    padding: var(--space-sm);
  }
</style>
