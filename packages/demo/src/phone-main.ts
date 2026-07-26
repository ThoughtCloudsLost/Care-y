import { mount } from "svelte";
import PhoneApp from "./PhoneApp.svelte";
import "./app.css";

class DemoMountError extends Error {
  override name = "DemoMountError" as const;
}

const target = document.getElementById("app");
if (!target) throw new DemoMountError("Missing #app mount target");

mount(PhoneApp, { target });
