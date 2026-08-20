<script lang="ts">
  let { name, pass, detail }: { name: string; pass: boolean; detail: string } =
    $props();
</script>

<div class="proof-row" class:pass class:fail={!pass}>
  <span class="proof-icon">{pass ? "[PASS]" : "[FAIL]"}</span>
  <span class="proof-name">{name}</span>
  <span class="proof-detail">{detail}</span>
</div>

<style>
  .proof-row {
    display: flex;
    gap: 0.5rem;
    padding: 0.3rem 0;
    border-bottom: 1px solid #eee;
    align-items: baseline;
  }

  .proof-icon {
    font-weight: 700;
    font-size: 11px;
    flex-shrink: 0;
    width: 48px;
  }

  .pass .proof-icon {
    color: #080;
  }

  .fail .proof-icon {
    color: #c00;
  }

  .proof-name {
    font-weight: 600;
    color: #333;
    flex-shrink: 0;
  }

  .proof-detail {
    color: #666;
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
