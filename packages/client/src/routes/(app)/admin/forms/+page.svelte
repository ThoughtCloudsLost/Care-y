<!--
  Admin intake forms page. Single route with in-page view state toggling
  between the list view and the editor view. Follows the admin destinations
  pattern: no sub-routes, component state drives the view.
-->
<script lang="ts">
  import { Block } from "konsta/svelte";
  import { createQuery } from "@tanstack/svelte-query";
  import {
    intakeFieldTypeSchema,
    intakeFieldRoleSchema,
    type IntakeFieldConfig,
    type IntakeFieldType,
    type IntakeFieldRole,
  } from "@care-y/shared";
  import * as m from "$lib/paraglide/messages.js";
  import { trpc } from "$lib/trpc/index.js";
  import { requireRouter } from "$lib/errors.js";
  import { intakeFormKeys } from "$lib/query/keys.js";
  import { getOrgKeyManager } from "$lib/crypto/context.js";
  import { getNavbarOverrideCtx } from "$lib/shell/context.js";
  import { decryptFieldContent } from "$lib/portal/intake-form-crypto.js";
  import IntakeFormsSection from "$lib/components/admin/IntakeFormsSection.svelte";
  import IntakeFormEditor from "$lib/components/admin/IntakeFormEditor.svelte";

  interface PlaintextField {
    label: string;
    isRequired: boolean;
    config: IntakeFieldConfig;
    fieldType: IntakeFieldType;
    role: IntakeFieldRole | null;
    routingQueueIds: string[] | null;
    escalationRecipientIds: string[] | null;
  }

  /** Wire shape returned by intakeForms.list */
  interface FormListItem {
    readonly id: string;
    readonly name: string;
    readonly isActive: boolean;
    readonly fieldCount: number;
  }

  type ViewState =
    | { kind: "list" }
    | { kind: "loading"; formId: string }
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

  let view = $state<ViewState>({ kind: "list" });

  const intakeFormsRouter = requireRouter(trpc.intakeForms, "intakeForms");
  const orgKeyManager = getOrgKeyManager();
  const navbarCtx = getNavbarOverrideCtx();

  const formsQuery = createQuery(() => ({
    queryKey: intakeFormKeys.list(),
    queryFn: async (): Promise<FormListItem[]> => {
      const result = await intakeFormsRouter.list.query();
      return result.forms;
    },
  }));

  function openEditor(formId: string): void {
    view = { kind: "loading", formId };
    void loadFormForEditing(formId);
  }

  async function loadFormForEditing(formId: string): Promise<void> {
    const orgPub = orgKeyManager.getPublicKey();
    if (!orgPub) {
      view = { kind: "load-error", message: m.error_generic() };
      return;
    }

    const formSummary = (formsQuery.data ?? []).find(
      (f: FormListItem) => f.id === formId,
    );
    if (!formSummary) {
      view = { kind: "load-error", message: m.error_generic() };
      return;
    }

    try {
      const formDetail = await intakeFormsRouter.get.query({ formId });

      const decryptedFields: PlaintextField[] = formDetail.fields.map(
        (field: {
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
            label: decrypted.label,
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
        formId,
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

  function openCreateEditor(): void {
    view = {
      kind: "editor",
      formId: null,
      formName: "",
      slug: null,
      isDefault: false,
      destinationQueueId: null,
      fields: [],
    };
  }

  function backToList(): void {
    view = { kind: "list" };
  }

  $effect(() => {
    if (view.kind === "list") {
      navbarCtx.current = {
        title: m.intake_forms_title(),
      };
    } else if (view.kind === "loading" || view.kind === "load-error") {
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

{#if view.kind === "list"}
  <IntakeFormsSection onedit={openEditor} oncreate={openCreateEditor} />
{:else if view.kind === "loading"}
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
