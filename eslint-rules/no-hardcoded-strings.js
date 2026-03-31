/**
 * ESLint rule: no-hardcoded-strings
 *
 * Flags hardcoded user-facing strings in Svelte templates that should use
 * Paraglide message functions for i18n. Covers two cases:
 *
 * 1. Attributes that carry user-visible text (aria-label, title, placeholder,
 *    alt, aria-placeholder, aria-description, aria-roledescription) using
 *    string literals instead of expressions.
 *
 * 2. Text content nodes (SvelteText) inside elements that are visible to
 *    users or screen readers.
 *
 * Deliberately ignores: CSS classes, role, type, id, name, data-*, href,
 * src, boolean attributes, whitespace-only text, punctuation-only text,
 * and text inside <script>/<style>.
 */

/** @type {Set<string>} Attributes that carry translatable user-facing text. */
const I18N_ATTRIBUTES = new Set([
  "aria-label",
  "aria-placeholder",
  "aria-description",
  "aria-roledescription",
  "aria-valuetext",
  "title",
  "placeholder",
  "alt",
  "label",
]);

/** @type {Set<string>} Values that are structural, not translatable. */
const BOOLEAN_ARIA_VALUES = new Set(["true", "false"]);

/**
 * Elements whose text content is never user-facing
 * (script, style, code blocks).
 */
const NON_CONTENT_ELEMENTS = new Set(["script", "style"]);

/**
 * Text that's clearly not a translatable string: whitespace, single chars,
 * numbers, punctuation-only, CSS-like values, HTML entities only.
 */
function isNonTranslatableText(text) {
  const trimmed = text.trim();
  if (trimmed.length === 0) return true;
  // Single character (icon placeholders, bullet chars)
  if ([...trimmed].length <= 1) return true;
  // Numbers only
  if (/^\d+$/.test(trimmed)) return true;
  // Punctuation and symbols only (no letters)
  if (/^[\s\p{P}\p{S}]+$/u.test(trimmed)) return true;
  return false;
}

/**
 * Walk up from a node to check if it's inside a non-content element
 * (script, style, or any custom-ignored element).
 */
function isInsideNonContentElement(node, ignoreElements) {
  let current = node.parent;
  while (current) {
    // svelte-eslint-parser uses SvelteStyleElement for <style> and
    // SvelteScriptElement for <script>. Both should be non-content.
    if (
      current.type === "SvelteStyleElement" ||
      current.type === "SvelteScriptElement"
    ) {
      return true;
    }
    if (current.type === "SvelteElement") {
      const elName = getElementName(current);
      if (NON_CONTENT_ELEMENTS.has(elName)) return true;
      if (ignoreElements.has(elName)) return true;
      // Found a content element, stop walking
      return false;
    }
    current = current.parent;
  }
  return false;
}

/**
 * Get the element name, handling both native elements and components.
 */
function getElementName(element) {
  if (element.name && typeof element.name === "object" && element.name.name) {
    return element.name.name;
  }
  if (typeof element.name === "string") {
    return element.name;
  }
  return "";
}

/** @type {import("eslint").Rule.RuleModule} */
const rule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Disallow hardcoded user-facing strings in Svelte templates. Use Paraglide message functions.",
    },
    messages: {
      hardcodedAttr:
        'Hardcoded string "{{text}}" in {{attr}} attribute. Use a Paraglide message function: {{attr}}={m.your_key()}',
      hardcodedText:
        'Hardcoded text "{{text}}". Use a Paraglide message function: {m.your_key()}',
    },
    schema: [
      {
        type: "object",
        properties: {
          ignoreAttributes: {
            type: "array",
            items: { type: "string" },
            description: "Additional attribute names to ignore.",
          },
          ignoreElements: {
            type: "array",
            items: { type: "string" },
            description: "Element names whose text content is ignored.",
          },
          ignoreText: {
            type: "array",
            items: { type: "string" },
            description:
              "Exact text values to ignore (e.g., brand names that should not be translated).",
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options[0] ?? {};
    const ignoreAttributes = new Set(options.ignoreAttributes ?? []);
    const ignoreElements = new Set(options.ignoreElements ?? []);
    const ignoreText = new Set(options.ignoreText ?? []);

    return {
      /**
       * Check attributes with string literal values that should be i18n.
       */
      SvelteAttribute(node) {
        // Only check attributes we know carry user-facing text
        const attrName =
          node.key && typeof node.key === "object" ? node.key.name : "";
        if (!I18N_ATTRIBUTES.has(attrName)) return;
        if (ignoreAttributes.has(attrName)) return;

        // Boolean attributes (no value) are fine
        if (node.boolean) return;

        // Check if value contains any string literals
        if (!Array.isArray(node.value)) return;

        for (const part of node.value) {
          if (part.type !== "SvelteLiteral") continue;

          const text = part.value;
          // aria-hidden="true"/"false" are structural, not translatable
          if (BOOLEAN_ARIA_VALUES.has(text)) continue;

          if (isNonTranslatableText(text)) continue;

          context.report({
            node: part,
            messageId: "hardcodedAttr",
            data: { text: truncate(text), attr: attrName },
          });
        }
      },

      /**
       * Check text content between tags.
       */
      SvelteText(node) {
        if (isNonTranslatableText(node.value)) return;
        if (isInsideNonContentElement(node, ignoreElements)) return;

        const text = node.value.trim();
        if (ignoreText.has(text)) return;

        context.report({
          node,
          messageId: "hardcodedText",
          data: { text: truncate(text) },
        });
      },
    };
  },
};

function truncate(str, max = 40) {
  return str.length > max ? str.slice(0, max) + "..." : str;
}

export default rule;
