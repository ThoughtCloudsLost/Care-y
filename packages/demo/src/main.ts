import { mount } from "svelte";
import App from "./App.svelte";
import { DemoMountError } from "./lib/errors.js";
import "./app.css";

const target = document.getElementById("app");
if (!target) throw new DemoMountError("Missing #app mount target");

mount(App, { target });
