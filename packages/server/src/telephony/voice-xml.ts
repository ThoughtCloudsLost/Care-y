import type { VoiceInstruction } from "./provider.js";
import { ValidationError } from "../errors.js";

const VERB_MAP: Record<string, string> = {
  say: "Say",
  play: "Play",
  gather: "Gather",
  record: "Record",
  hangup: "Hangup",
  dial: "Dial",
  pause: "Pause",
};

/** Verbs that render as self-closing tags (no text body, no children). */
const SELF_CLOSING_VERBS = new Set(["hangup", "pause", "record"]);

/**
 * Escape the 5 XML-reserved characters.
 * Ampersand must be replaced first to avoid double-escaping.
 */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildAttributeString(
  attributes: Record<string, string | number | boolean>,
): string {
  const parts: string[] = [];
  for (const [key, val] of Object.entries(attributes)) {
    if (key === "text") continue;
    parts.push(
      `${escapeXml(key)}="${escapeXml(typeof val === "string" ? val : String(val))}"`,
    );
  }
  return parts.length > 0 ? " " + parts.join(" ") : "";
}

export function renderInstruction(instruction: VoiceInstruction): string {
  const verb = VERB_MAP[instruction.type];
  if (verb === undefined) {
    throw new ValidationError(
      `Unknown voice instruction type: ${instruction.type}`,
    );
  }

  const attrs = instruction.attributes
    ? buildAttributeString(instruction.attributes)
    : "";

  if (SELF_CLOSING_VERBS.has(instruction.type)) {
    return `<${verb}${attrs}/>`;
  }

  const textBody =
    instruction.attributes && typeof instruction.attributes.text === "string"
      ? escapeXml(instruction.attributes.text)
      : typeof instruction.attributes?.text === "number" ||
          typeof instruction.attributes?.text === "boolean"
        ? escapeXml(String(instruction.attributes.text))
        : "";

  const childrenXml = instruction.children
    ? instruction.children.map(renderInstruction).join("")
    : "";

  return `<${verb}${attrs}>${textBody}${childrenXml}</${verb}>`;
}

export function renderVoiceXml(
  instructions: readonly VoiceInstruction[],
  rootElement = "Response",
): string {
  const body = instructions.map(renderInstruction).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><${rootElement}>${body}</${rootElement}>`;
}
