<!--
  Intake form editor page. The forms list lives in the organization admin
  page (Intake Forms section); this route hosts only the editor. `?id=<uuid>`
  edits an existing form, no query param creates a new one. Back and delete
  return to the organization section.
-->
<script lang="ts">
  import { goto } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
  import { Block } from "konsta/svelte";
  import {
    intakeFieldTypeSchema,
    intakeFieldRoleSchema,
    resolveLocalized,
    BASE_LOCALE,
    type IntakeFieldConfig,
    type IntakeFieldType,
    type IntakeFieldRole,
  } from "@care-y/shared";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { requireRouter } from "$lib/errors.js";
  import { getOrgKeyManager } from "$lib/crypto/context.js";
  import { getNavbarOverrideCtx } from "$lib/shell/context.js";
  import { decryptFieldContent } from "$lib/portal/intake-form-crypto.js";
  import IntakeFormEditor from "$lib/components/admin/IntakeFormEditor.svelte";

  interface PlaintextField {
    fieldKey: string;
    label: string;
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
        fields: PlaintextField[];
      };

  let view = $state<ViewState>({ kind: "loading" });

  const intakeFormsRouter = requireRouter(trpc.intakeForms, "intakeForms");
  const orgKeyManager = getOrgKeyManager();
  const navbarCtx = getNavbarOverrideCtx();

  const formId = $derived(page.url.searchParams.get("id"));
  const listPath = `${resolve("/admin/organization")}?tab=intake-forms`;

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
          return {
            fieldKey: field.fieldKey,
            label: resolveLocalized(decrypted.label, BASE_LOCALE) ?? "",
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

      view = {
        kind: "editor",
        formId: id,
        formName: formDetail.name,
        slug: formDetail.slug ?? null,
        isDefault: formDetail.isDefault,
        destinationQueueId: formDetail.destinationQueueId ?? null,
        fields: decryptedFields,
      };
    } catch {
      view = { kind: "load-error", message: m.error_generic() };
    }
  }

  function backToList(): void {
    // eslint-disable-next-line svelte/no-navigation-without-resolve -- listPath is built from resolve() above
    void goto(listPath);
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
        title: m.intake_forms_edit_title(),
      };
    } else {
      navbarCtx.current = {
        title:
          view.formId !== null
            ? m.intake_forms_edit_title()
            : m.intake_forms_create_title(),
      };
    }
  });
</script>

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
    initialFields={view.fields}
    onback={backToList}
    ondeleted={backToList}
  />
{/if}

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
