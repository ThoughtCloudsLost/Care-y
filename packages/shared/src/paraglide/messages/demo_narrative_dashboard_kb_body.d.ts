/**
* | output |
* | --- |
* | "A preview of recently updated knowledge base articles. **Encryption.** Article titles are encrypted with the organization key. The server stores ciphertext a..." |
*
* @param {Demo_Narrative_Dashboard_Kb_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_kb_body: ((inputs?: Demo_Narrative_Dashboard_Kb_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Dashboard_Kb_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Dashboard_Kb_BodyInputs = {};
