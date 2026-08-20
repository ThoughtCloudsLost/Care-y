<script lang="ts">
  let { label, ms }: { label: string; ms: number } = $props();
</script>

<div class="timing-row">
  <span class="timing-label">{label}</span>
  <span class="timing-value">{ms} ms</span>
</div>

<style>
  .timing-row {
    display: flex;
    justify-content: space-between;
    padding: 0.2rem 0;
    border-bottom: 1px solid #eee;
  }

  .timing-label {
    color: #333;
  }

  .timing-value {
    font-weight: 600;
    color: #0066cc;
    min-width: 80px;
    text-align: right;
  }
</style>
