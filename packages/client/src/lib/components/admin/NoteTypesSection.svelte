<script lang="ts">
  import {
    Card,
    List,
    ListItem,
    ListInput,
    Toggle,
    Button,
    Segmented,
    SegmentedButton,
  } from "konsta/svelte";
  import { useQueryClient } from "@tanstack/svelte-query";
  import { noteTypeKeys } from "$lib/query/keys.js";
  import {
    MessagesSquare,
    ArrowLeftRight,
    UserCheck,
    ChevronsUp,
    CirclePause,
    Replace,
    Phone,
    Plus,
    Pencil,
    type LucideIcon,
  } from "@lucide/svelte";
  import * as m from "$lib/paraglide/messages.js";
  import { withTerms } from "$lib/terminology/with-terms.js";
  import { trpc } from "$lib/trpc/index.js";
  import { getOrgDecryptCache, getOrgKeyManager } from "$lib/crypto/context.js";
  import {
    createAllNoteTypesQuery,
    createNoteTypesQuery,
  } from "$lib/tickets/queries.js";
  import {
    resolveNoteTypeIcon,
    ICON_PICKER_ENTRIES,
  } from "$lib/utils/note-type-icons.js";
  import { haptic } from "$lib/utils/haptic.js";
  import { toastStore } from "$lib/stores/toast.svelte.js";
  import { announceToLiveRegion } from "$lib/utils/announce.js";
  import { requireRouter } from "$lib/errors.js";
  import QueryError from "$lib/components/QueryError.svelte";
  import DecryptPlaceholder from "$lib/components/DecryptPlaceholder.svelte";
  import ShellSheet from "$lib/shell/ShellSheet.svelte";
  import SoftButton from "$lib/components/inputs/SoftButton.svelte";
  import {
    RoleId,
    ROLE_ID_VALUES,
    type EscalationTarget,
    type RoleIdValue,
  } from "@care-y/shared";
  import type { SerializedBuffer } from "$lib/utils/buffer-encoding.js";

  const ticketRouter = requireRouter(trpc.tickets, "tickets");
  const noteTypesRouter = requireRouter(ticketRouter.noteTypes, "noteTypes");

  const orgCache = getOrgDecryptCache();
  const orgKeyManager = getOrgKeyManager();
  const queryClient = useQueryClient();
  const noteTypesQuery = createAllNoteTypesQuery(noteTypesRouter);
  const activeTypesQuery = createNoteTypesQuery(noteTypesRouter);
  const defaultNoteTypeId = $derived(
    activeTypesQuery.data?.defaultNoteTypeId ?? null,
  );

  // ── System follow-up types (read-only reference) ──

  interface SystemType {
    readonly icon: LucideIcon;
    readonly label: () => string;
    readonly description: () => string;
  }

  const SYSTEM_TYPES: readonly SystemType[] = [
    {
      icon: MessagesSquare,
      label: m.followup_type_message,
      description: m.followup_type_message_desc,
    },
    {
      icon: ArrowLeftRight,
      label: m.followup_type_status_change,
      description: m.followup_type_status_change_desc,
    },
    {
      icon: UserCheck,
      label: m.followup_type_assignment_change,
      description: () => m.followup_type_assignment_change_desc(withTerms()),
    },
    {
      icon: ChevronsUp,
      label: m.followup_type_priority_change,
      description: m.followup_type_priority_change_desc,
    },
    {
      icon: CirclePause,
      label: m.followup_type_hold_change,
      description: () => m.followup_type_hold_change_desc(withTerms()),
    },
    {
      icon: Replace,
      label: () => m.followup_type_merge_note(withTerms()),
      description: () => m.followup_type_merge_note_desc(withTerms()),
    },
    {
      icon: Phone,
      label: m.followup_type_phone_call,
      description: m.followup_type_phone_call_desc,
    },
  ];

  // ── Escalation summary for list subtitles ──

  const ROLE_SUMMARY_LABELS: Record<string, () => string> = {
    admin: m.admin_note_types_summary_admins,
    manager: () => m.admin_note_types_summary_managers(withTerms()),
  };

  function escalationSummary(targets: EscalationTarget[]): string {
    if (targets.length === 0) return m.admin_note_types_no_escalation();
    const parts: string[] = [];
    if (targets.some((t) => t.type === "ticket_access")) {
      parts.push(m.admin_note_types_summary_participants());
    }
    for (const t of targets) {
      if (t.type === "role") {
        const label = ROLE_SUMMARY_LABELS[t.value];
        if (label) parts.push(label());
      }
    }
    return parts.length > 0
      ? m.admin_note_types_notifies({ targets: parts.join(", ") })
      : m.admin_note_types_no_escalation();
  }

  function roleGatingSummary(
    minViewRole: string,
    minCreateRole: string,
  ): string | null {
    const isViewRestricted = minViewRole !== RoleId.VOLUNTEER;
    const isCreateRestricted = minCreateRole !== RoleId.VOLUNTEER;
    if (!isViewRestricted && !isCreateRestricted) return null;
    const parts: string[] = [];
    if (isViewRestricted) {
      parts.push(
        m.admin_note_types_view_restricted({ role: roleLabelFor(minViewRole) }),
      );
    }
    if (isCreateRestricted) {
      parts.push(
        m.admin_note_types_create_restricted({
          role: roleLabelFor(minCreateRole),
        }),
      );
    }
    return parts.join(", ");
  }

  // ── Edit/create sheet state ──

  interface EditingNoteType {
    readonly id: string;
    readonly escalationTargets: EscalationTarget[];
  }

  let sheetOpen = $state(false);
  let editingType = $state<EditingNoteType | null>(null);
  let editName = $state("");
  let editIcon = $state("sticky-note");
  let editEscalateAdmin = $state(false);
  let editEscalateManager = $state(false);
  let editDescription = $state("");
  let editNotifyParticipants = $state(false);
  let editRequiresOnClose = $state(false);
  let editIsActive = $state(true);
  let editMinViewRole = $state<RoleIdValue>(RoleId.VOLUNTEER);
  let editMinCreateRole = $state<RoleIdValue>(RoleId.VOLUNTEER);
  let sheetSaving = $state(false);

  const ROLE_OPTIONS: readonly { id: RoleIdValue; label: () => string }[] = [
    { id: RoleId.VOLUNTEER, label: () => m.admin_role_volunteer(withTerms()) },
    { id: RoleId.MANAGER, label: () => m.admin_role_manager(withTerms()) },
    { id: RoleId.ADMIN, label: m.admin_role_admin },
  ];

  function roleLabelFor(roleId: string): string {
    const opt = ROLE_OPTIONS.find((r) => r.id === roleId);
    return opt ? opt.label() : m.admin_role_volunteer(withTerms());
  }

  const isCreateMode = $derived(editingType === null);
  const sheetTitle = $derived(
    isCreateMode ? m.admin_note_types_add() : m.admin_note_types_edit(),
  );
  const canSaveSheet = $derived(editName.trim().length > 0 && !sheetSaving);

  async function handleDeactivateToggle(): Promise<void> {
    if (editingType === null) return;
    sheetSaving = true;
    try {
      const newActive = !editIsActive;
      await noteTypesRouter.update.mutate({
        id: editingType.id,
        isActive: newActive,
      });
      haptic();
      const msg = newActive ? m.note_type_updated() : m.note_type_deactivated();
      toastStore.show(msg);
      announceToLiveRegion("polite", msg);
      void queryClient.invalidateQueries({ queryKey: noteTypeKeys.all });
      void queryClient.invalidateQueries({ queryKey: noteTypeKeys.full() });
      dismissSheet();
    } catch {
      toastStore.show(m.error_generic(), 3000);
    } finally {
      sheetSaving = false;
    }
  }
  const editingIsDefault = $derived(
    editingType !== null && editingType.id === defaultNoteTypeId,
  );

  function openCreateSheet(): void {
    editingType = null;
    editName = "";
    editIcon = "sticky-note";
    editDescription = "";
    editEscalateAdmin = false;
    editEscalateManager = false;
    editNotifyParticipants = false;
    editRequiresOnClose = false;
    editIsActive = true;
    editMinViewRole = RoleId.VOLUNTEER;
    editMinCreateRole = RoleId.VOLUNTEER;
    sheetOpen = true;
  }

  function openEditSheet(nt: {
    id: string;
    escalationTargets: EscalationTarget[];
    requiresOnClose: boolean;
    isActive: boolean;
    minViewRole: string;
    minCreateRole: string;
    encryptedName: SerializedBuffer;
    encryptedIcon: SerializedBuffer;
    encryptedDescription: SerializedBuffer | null;
  }): void {
    editingType = { id: nt.id, escalationTargets: nt.escalationTargets };
    editName = orgCache.decrypt(nt.id + ":name", nt.encryptedName) ?? "";
    editIcon =
      orgCache.decrypt(nt.id + ":icon", nt.encryptedIcon) ?? "sticky-note";
    editDescription = nt.encryptedDescription
      ? (orgCache.decrypt(nt.id + ":desc", nt.encryptedDescription) ?? "")
      : "";
    editEscalateAdmin = nt.escalationTargets.some(
      (t) => t.type === "role" && t.value === "admin",
    );
    editEscalateManager = nt.escalationTargets.some(
      (t) => t.type === "role" && t.value === "manager",
    );
    editNotifyParticipants = nt.escalationTargets.some(
      (t) => t.type === "ticket_access",
    );
    editRequiresOnClose = nt.requiresOnClose;
    editIsActive = nt.isActive;
    const viewId = ROLE_ID_VALUES.find((id) => id === nt.minViewRole);
    editMinViewRole = viewId ?? RoleId.VOLUNTEER;
    const createId = ROLE_ID_VALUES.find((id) => id === nt.minCreateRole);
    editMinCreateRole = createId ?? RoleId.VOLUNTEER;
    sheetOpen = true;
  }

  function dismissSheet(): void {
    sheetOpen = false;
  }

  function buildEscalationTargets(): EscalationTarget[] {
    const targets: EscalationTarget[] = [];
    if (editNotifyParticipants) targets.push({ type: "ticket_access" });
    if (editEscalateAdmin) targets.push({ type: "role", value: "admin" });
    if (editEscalateManager) targets.push({ type: "role", value: "manager" });
    return targets;
  }

  async function handleSheetSave(): Promise<void> {
    const name = editName.trim();
    if (name.length === 0) return;

    sheetSaving = true;
    try {
      const encryptedName = await orgKeyManager.encryptText(name);
      const encryptedIcon = await orgKeyManager.encryptText(editIcon);
      const desc = editDescription.trim();
      const encryptedDescription =
        desc.length > 0 ? await orgKeyManager.encryptText(desc) : undefined;
      const escalationTargets = buildEscalationTargets();

      if (isCreateMode) {
        await noteTypesRouter.create.mutate({
          encryptedName,
          encryptedIcon,
          encryptedDescription,
          escalationTargets,
          requiresOnClose: editRequiresOnClose,
          minViewRole: editMinViewRole,
          minCreateRole: editMinCreateRole,
        });
        haptic();
        toastStore.show(m.note_type_created());
        announceToLiveRegion("polite", m.note_type_created());
      } else if (editingType !== null) {
        const editId = editingType.id;
        await noteTypesRouter.update.mutate({
          id: editId,
          encryptedName,
          encryptedIcon,
          encryptedDescription: desc.length > 0 ? encryptedDescription : null,
          escalationTargets,
          requiresOnClose: editRequiresOnClose,
          minViewRole: editMinViewRole,
          minCreateRole: editMinCreateRole,
        });
        orgCache.delete(editId + ":name");
        orgCache.delete(editId + ":icon");
        orgCache.delete(editId + ":desc");
        haptic();
        toastStore.show(m.note_type_updated());
        announceToLiveRegion("polite", m.note_type_updated());
      }

      void queryClient.invalidateQueries({ queryKey: noteTypeKeys.all });
      void queryClient.invalidateQueries({ queryKey: noteTypeKeys.full() });
      dismissSheet();
    } catch {
      toastStore.show(m.error_generic(), 3000);
    } finally {
      sheetSaving = false;
    }
  }
</script>

{#if noteTypesQuery.isLoading}
  <Card raised contentWrap={false} class="fut-card">
    <div class="fut-card-inner">
      <p class="section-desc">{m.admin_note_types_description(withTerms())}</p>
      <h4 class="fut-group-label">{m.admin_note_types_group_configurable()}</h4>
      {#each { length: 4 } as _, i (i)}
        <div class="fut-row">
          <DecryptPlaceholder length={12} />
        </div>
      {/each}
      <div class="section-divider" role="separator"></div>
      <h4 class="fut-group-label">{m.admin_note_types_group_system()}</h4>
      {#each SYSTEM_TYPES as st (st.label())}
        <div class="fut-row">
          <span class="fut-row-label">
            <st.icon size={16} aria-hidden="true" class="fut-sys-icon" />
            <span>{st.label()}</span>
          </span>
        </div>
      {/each}
    </div>
  </Card>
{:else if noteTypesQuery.isError}
  <QueryError
    error={noteTypesQuery.error}
    onretry={() => void noteTypesQuery.refetch()}
  />
{:else if noteTypesQuery.data}
  <Card raised contentWrap={false} class="fut-card">
    <div class="fut-card-inner">
      <p class="section-desc">{m.admin_note_types_description(withTerms())}</p>
      <h4 class="fut-group-label">{m.admin_note_types_group_configurable()}</h4>
      {#each noteTypesQuery.data as nt (nt.id)}
        {@const Icon = resolveNoteTypeIcon(
          orgCache.decrypt(nt.id + ":icon", nt.encryptedIcon),
        )}
        {@const gating = roleGatingSummary(nt.minViewRole, nt.minCreateRole)}
        <button
          type="button"
          class="fut-row fut-row-interactive touch-feedback"
          class:fut-row-inactive={!nt.isActive}
          onclick={() => openEditSheet(nt)}
        >
          <span class="fut-row-label">
            <Icon size={16} aria-hidden="true" class="fut-cfg-icon" />
            <span class="fut-row-text">
              <span class="fut-row-name">
                <DecryptPlaceholder
                  content={orgCache.decrypt(nt.id + ":name", nt.encryptedName)}
                  length={12}
                />
                {#if !nt.isActive}
                  <span class="inactive-badge">{m.admin_status_inactive()}</span
                  >
                {/if}
              </span>
              <span class="fut-row-sub">
                {escalationSummary(nt.escalationTargets)}{nt.requiresOnClose
                  ? ` · ${m.admin_note_types_close_required()}`
                  : ""}{#if gating}
                  · {gating}{/if}
              </span>
              {#if nt.encryptedDescription}
                {@const desc = orgCache.decrypt(
                  nt.id + ":desc",
                  nt.encryptedDescription,
                )}
                {#if desc}
                  <span class="fut-row-desc">{desc}</span>
                {/if}
              {/if}
            </span>
          </span>
          <span class="fut-edit-btn" aria-hidden="true">
            <Pencil size={14} />
          </span>
        </button>
      {/each}

      <SoftButton onclick={openCreateSheet} full>
        <Plus size={16} aria-hidden="true" />
        {m.admin_note_types_add()}
      </SoftButton>

      <div class="section-divider" role="separator"></div>

      <h4 class="fut-group-label">{m.admin_note_types_group_system()}</h4>
      {#each SYSTEM_TYPES as st (st.label())}
        <div class="fut-row">
          <span class="fut-row-label">
            <st.icon size={16} aria-hidden="true" class="fut-sys-icon" />
            <span class="fut-row-text">
              <span>{st.label()}</span>
              <span class="fut-row-sub">{st.description()}</span>
            </span>
          </span>
        </div>
      {/each}
    </div>
  </Card>
{/if}

<!-- Edit / Create Sheet -->
<ShellSheet
  opened={sheetOpen}
  ondismiss={dismissSheet}
  ariaLabel={sheetTitle}
  title={sheetTitle}
>
  {#snippet headerRight()}
    <SoftButton onclick={() => void handleSheetSave()} disabled={!canSaveSheet}>
      {sheetSaving ? m.common_loading() : m.common_save()}
    </SoftButton>
  {/snippet}

  <div class="edit-sheet-body">
    <List nested class="edit-sheet-list">
      <ListInput
        outline
        label={m.admin_note_types_name_label()}
        type="text"
        value={editName}
        onInput={(e: Event) => {
          const target = e.target;
          if (target instanceof HTMLInputElement) {
            editName = target.value;
          }
        }}
        disabled={sheetSaving}
      />
      <ListInput
        outline
        label={m.admin_note_types_description_label()}
        type="textarea"
        placeholder={m.admin_note_types_description_placeholder()}
        value={editDescription}
        onInput={(e: Event) => {
          const target = e.target;
          if (target instanceof HTMLTextAreaElement) {
            editDescription = target.value;
            target.style.height = "auto";
            target.style.height = `${String(target.scrollHeight)}px`;
          }
        }}
        disabled={sheetSaving}
        inputClass="desc-textarea"
      />
    </List>

    <div class="edit-sheet-section">
      <span class="edit-sheet-label">{m.admin_note_types_icon_label()}</span>
      <div class="icon-picker-grid">
        {#each ICON_PICKER_ENTRIES as entry (entry.slug)}
          {@const IconComp = entry.component}
          <Button
            clear
            small
            class="icon-picker-btn {editIcon === entry.slug
              ? 'icon-picker-active'
              : ''}"
            onclick={() => {
              editIcon = entry.slug;
            }}
            aria-label={entry.slug}
            aria-pressed={editIcon === entry.slug}
          >
            <IconComp size={20} />
          </Button>
        {/each}
      </div>
    </div>

    <div class="edit-sheet-section">
      <span class="edit-sheet-label">
        {m.admin_note_types_escalation_label()}
      </span>
      <List nested class="edit-sheet-list">
        <ListItem title={m.admin_note_types_notify_participants(withTerms())}>
          {#snippet after()}
            <Toggle
              checked={editNotifyParticipants}
              onchange={() => {
                editNotifyParticipants = !editNotifyParticipants;
              }}
              disabled={sheetSaving}
            />
          {/snippet}
        </ListItem>
        <ListItem title={m.admin_note_types_escalate_admin()}>
          {#snippet after()}
            <Toggle
              checked={editEscalateAdmin}
              onchange={() => {
                editEscalateAdmin = !editEscalateAdmin;
              }}
              disabled={sheetSaving}
            />
          {/snippet}
        </ListItem>
        <ListItem title={m.admin_note_types_escalate_manager(withTerms())}>
          {#snippet after()}
            <Toggle
              checked={editEscalateManager}
              onchange={() => {
                editEscalateManager = !editEscalateManager;
              }}
              disabled={sheetSaving}
            />
          {/snippet}
        </ListItem>
      </List>
    </div>

    <div class="edit-sheet-section">
      <span class="edit-sheet-label">
        {m.admin_note_types_role_gating_label()}
      </span>
      <div class="role-gating-row">
        <span class="role-gating-sublabel"
          >{m.admin_note_types_min_view_role()}</span
        >
        <Segmented strong class="role-gating-seg">
          {#each ROLE_OPTIONS as opt (opt.id)}
            <SegmentedButton
              active={editMinViewRole === opt.id}
              onclick={() => {
                editMinViewRole = opt.id;
              }}
            >
              {opt.label()}
            </SegmentedButton>
          {/each}
        </Segmented>
      </div>
      <div class="role-gating-row">
        <span class="role-gating-sublabel"
          >{m.admin_note_types_min_create_role()}</span
        >
        <Segmented strong class="role-gating-seg">
          {#each ROLE_OPTIONS as opt (opt.id)}
            <SegmentedButton
              active={editMinCreateRole === opt.id}
              onclick={() => {
                editMinCreateRole = opt.id;
              }}
            >
              {opt.label()}
            </SegmentedButton>
          {/each}
        </Segmented>
      </div>
    </div>

    <List nested class="edit-sheet-list">
      <ListItem title={m.admin_note_types_close_required()}>
        {#snippet after()}
          <Toggle
            checked={editRequiresOnClose}
            onchange={() => {
              editRequiresOnClose = !editRequiresOnClose;
            }}
            disabled={sheetSaving}
          />
        {/snippet}
      </ListItem>
    </List>

    {#if !isCreateMode && !editingIsDefault}
      <div class="deactivate-action">
        <button
          type="button"
          class="deactivate-btn"
          onclick={() => void handleDeactivateToggle()}
          disabled={sheetSaving}
        >
          {editIsActive ? m.admin_deactivate() : m.admin_reactivate()}
        </button>
      </div>
    {/if}
  </div>
</ShellSheet>

<style>
  :global(.fut-card) {
    margin: var(--space-sm) var(--space-md) !important;
  }

  .fut-card-inner {
    padding: var(--space-md) var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .section-desc {
    font-size: var(--text-sm);
    color: var(--muted);
    line-height: 1.5;
    margin-bottom: var(--space-sm);
  }

  .fut-group-label {
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--muted);
    margin: var(--space-sm) 0 var(--space-xs);
  }

  .section-divider {
    height: 1px;
    background: var(--surface-2);
    margin: var(--space-md) 0 var(--space-sm);
  }

  .fut-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-sm);
    padding: 0.5rem 0;
    min-height: 2.5rem;
  }

  .fut-row-interactive {
    width: 100%;
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
    border-radius: 0.375rem;
    padding: 0.5rem 0.25rem;
    margin: 0 -0.25rem;
    font: inherit;
    color: inherit;
  }

  .fut-row-inactive {
    opacity: 0.5;
  }

  .fut-row-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
  }

  .fut-row-name {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
  }

  .inactive-badge {
    font-size: var(--text-xs);
    color: var(--color-red-500);
    font-weight: 600;
    flex-shrink: 0;
  }

  .fut-row-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .fut-row-sub {
    font-size: 0.6875rem;
    color: var(--muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .fut-row-desc {
    font-size: 0.6875rem;
    color: var(--muted);
    opacity: 0.75;
    white-space: pre-line;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
  }

  :global(.fut-cfg-icon) {
    color: var(--brand-accent, var(--brand-primary));
    flex-shrink: 0;
  }

  :global(.fut-sys-icon) {
    color: var(--muted);
    flex-shrink: 0;
  }

  .fut-edit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.75rem;
    height: 2.75rem;
    min-width: 2.75rem;
    min-height: 2.75rem;
    border-radius: 50%;
    background: none;
    border: none;
    padding: 0;
    color: var(--muted);
    flex-shrink: 0;
    -webkit-tap-highlight-color: transparent;
  }

  .edit-sheet-body {
    padding: var(--space-md) var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .edit-sheet-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .edit-sheet-label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--muted);
  }

  .icon-picker-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.25rem;
  }

  :global(.icon-picker-btn) {
    aspect-ratio: 1;
    border-radius: 0.5rem;
    color: var(--ink);
  }

  :global(.icon-picker-active) {
    background: var(--brand-primary) !important;
    color: var(--paper) !important;
  }

  :global(.desc-textarea) {
    min-height: calc(2lh) !important;
    resize: none;
    overflow: hidden;
  }

  :global(.edit-sheet-list) {
    margin: 0 !important;
  }

  .role-gating-row {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .role-gating-sublabel {
    font-size: var(--text-xs);
    color: var(--muted);
  }

  :global(.role-gating-seg) {
    width: 100%;
  }

  .deactivate-action {
    padding: var(--space-2xl) var(--space-lg) 0;
  }

  .deactivate-btn {
    display: block;
    width: 100%;
    padding: 0.625rem;
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-red-500);
    background: none;
    border: none;
    cursor: pointer;
    text-align: center;
    min-height: 44px;
  }
</style>
