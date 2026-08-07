/**
 * Health entry point.
 *
 * Mounts HealthApp into the #health-app target. Imports the demo's
 * app.css so that mounted route components receive the same styling
 * they would in the real demo phone iframe.
 */

import { mount } from "svelte";
import HealthApp from "./HealthApp.svelte";
import { DemoMountError } from "../lib/errors.js";
import "../app.css";

document.title = "CARE-Y Demo Health Check";

const target = document.getElementById("health-app");
if (!target) throw new DemoMountError("Missing #health-app mount target");

mount(HealthApp, { target });
