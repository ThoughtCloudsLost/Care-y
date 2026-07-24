<!--
  Test fixture for default-form-skin.test.ts. Renders the ListInput
  variants the Inkwell form skin styles (text, textarea, select) so the
  selector-contract test can assert against real Konsta DOM. All copy
  arrives via props from the test; nothing here is user-facing.
-->
<script lang="ts">
  import { List, ListInput, Segmented, SegmentedButton } from "konsta/svelte";

  interface Props {
    textLabel: string;
    textPlaceholder: string;
    infoText: string;
    areaLabel: string;
    selectLabel: string;
    segmentOne: string;
    segmentTwo: string;
    error?: string;
    outline?: boolean;
  }

  let {
    textLabel,
    textPlaceholder,
    infoText,
    areaLabel,
    selectLabel,
    segmentOne,
    segmentTwo,
    error,
    outline,
  }: Props = $props();
</script>

<List nested>
  <ListInput
    label={textLabel}
    type="text"
    placeholder={textPlaceholder}
    info={infoText}
    {error}
    {outline}
  />
  <ListInput label={areaLabel} type="textarea" />
  <ListInput label={selectLabel} type="select" dropdown>
    <option value="a">A</option>
    <option value="b">B</option>
  </ListInput>
</List>

<Segmented strong>
  <SegmentedButton active>{segmentOne}</SegmentedButton>
  <SegmentedButton>{segmentTwo}</SegmentedButton>
</Segmented>
