<script lang="ts">
  import {
    Page,
    Navbar,
    Block,
    Tabbar,
    TabbarLink,
    Button,
  } from "konsta/svelte";
  import { themeStore } from "$lib/stores/theme.svelte";

  let activeTab = $state("inbox");
</script>

<Page>
  <Navbar title="CARE-Y" />

  <Block strong inset class="space-y-4">
    <p>
      Theme: <strong>{themeStore.current}</strong>
    </p>
    <Button
      onclick={() => {
        themeStore.toggle();
      }}
    >
      Switch to {themeStore.current === "ios" ? "Material" : "iOS"}
    </Button>
  </Block>

  <Block strong inset>
    <p>Active tab: <strong>{activeTab}</strong></p>
  </Block>

  <Tabbar labels class="left-0 bottom-0 fixed">
    <TabbarLink
      active={activeTab === "inbox"}
      onclick={() => (activeTab = "inbox")}
      label="Inbox"
    />
    <TabbarLink
      active={activeTab === "tickets"}
      onclick={() => (activeTab = "tickets")}
      label="Tickets"
    />
    <TabbarLink
      active={activeTab === "schedule"}
      onclick={() => (activeTab = "schedule")}
      label="Schedule"
    />
  </Tabbar>
</Page>
