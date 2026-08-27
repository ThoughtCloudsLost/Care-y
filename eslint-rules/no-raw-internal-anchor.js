/**
 * ESLint rule: no-raw-internal-anchor
 *
 * Flags `<a>` elements pointing at an in-app path. In-app navigation goes
 * through `goto()`; a raw anchor performs a real cross-document navigation
 * instead of a client-side route change.
 *
 * That difference is invisible in the app itself, where SvelteKit's client
 * router intercepts anchor clicks and turns them back into route changes.
 * It is not invisible anywhere the router is not running. The demo mounts
 * route components directly without starting the router, so a raw internal
 * anchor unloads the document and blanks the frame. Cross-document view
 * transitions then report `AbortError: Transition was skipped`, which
 * describes a consequence rather than the cause and sends the reader in the
 * wrong direction.
 *
 * Recognized as in-app: a path-absolute literal (`/admin/forms`), and any
 * expression calling SvelteKit's `resolve()`, which exists to build in-app
 * paths.
 *
 * Not flagged: absolute URLs and non-http schemes (`https:`, `mailto:`,
 * `tel:`), protocol-relative URLs, fragment-only links, and anchors carrying
 * `target` or `download`. Those last two are explicit statements that the
 * element wants link behavior the router cannot provide, so they read as a
 * decision rather than an oversight.
 *
 * An error boundary is the one place a raw internal anchor is correct, since
 * it can render when the router itself has failed. `routes/+error.svelte`
 * carries an inline disable with that reason.
 */

/** Attributes whose presence means the element wants real link behavior. */
const LINK_SEMANTIC_ATTRIBUTES = new Set(["target", "download"]);

/** Schemes and forms that leave the app. */
const EXTERNAL_PREFIX = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

/** Returns the element name for both native elements and components. */
function elementName(element) {
  const name = element.name;
  if (name && typeof name === "object" && typeof name.name === "string") {
    return name.name;
  }
  return typeof name === "string" ? name : "";
}

/** Returns the attribute's name, or "" when it has none. */
function attributeName(attribute) {
  const key = attribute.key;
  return key && typeof key === "object" && typeof key.name === "string"
    ? key.name
    : "";
}

/** Returns true when a literal href string points inside the app. */
function isInternalPath(value) {
  const trimmed = value.trim();
  if (trimmed.length === 0) return false;
  if (trimmed.startsWith("#")) return false;
  if (EXTERNAL_PREFIX.test(trimmed)) return false;
  return trimmed.startsWith("/");
}

/**
 * Returns true when an expression calls `resolve()`.
 *
 * SvelteKit's `resolve` builds in-app paths, so its presence in an href is a
 * direct statement that the target is a route. Checked recursively because
 * the call is often nested, as in a template literal or a conditional.
 */
function callsResolve(node, seen = new Set()) {
  if (node === null || typeof node !== "object" || seen.has(node)) return false;
  seen.add(node);

  if (
    node.type === "CallExpression" &&
    node.callee &&
    node.callee.type === "Identifier" &&
    node.callee.name === "resolve"
  ) {
    return true;
  }

  for (const [key, child] of Object.entries(node)) {
    if (key === "parent") continue;
    if (Array.isArray(child)) {
      if (child.some((item) => callsResolve(item, seen))) return true;
    } else if (child && typeof child === "object" && "type" in child) {
      if (callsResolve(child, seen)) return true;
    }
  }
  return false;
}

/** @type {import("eslint").Rule.RuleModule} */
const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow raw anchor elements for in-app navigation. Use goto() so the client router handles the transition.",
    },
    schema: [],
    messages: {
      rawInternalAnchor:
        "Raw <a> for in-app navigation performs a cross-document navigation instead of a client-side route change, which breaks anywhere the router is not running. Use a button whose handler calls goto(). If this genuinely needs link behavior, add target or download to say so.",
    },
  },

  create(context) {
    return {
      SvelteElement(node) {
        if (elementName(node) !== "a") return;

        const attributes = Array.isArray(node.startTag?.attributes)
          ? node.startTag.attributes
          : (node.attributes ?? []);
        if (!Array.isArray(attributes)) return;

        let href = null;
        for (const attribute of attributes) {
          const name = attributeName(attribute);
          if (LINK_SEMANTIC_ATTRIBUTES.has(name)) return;
          if (name === "href") href = attribute;
        }
        if (href === null || !Array.isArray(href.value)) return;

        const internal = href.value.some((part) => {
          if (part.type === "SvelteLiteral") return isInternalPath(part.value);
          if (part.expression) return callsResolve(part.expression);
          return false;
        });
        if (!internal) return;

        context.report({ node: href, messageId: "rawInternalAnchor" });
      },
    };
  },
};

export default rule;
