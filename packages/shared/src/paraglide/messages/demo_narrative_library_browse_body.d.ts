/**
* | output |
* | --- |
* | "Any user holding the View knowledge base permission can read every article the organization keeps, with no per-article access restriction. An article has no ..." |
*
* @param {Demo_Narrative_Library_Browse_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_library_browse_body: ((inputs?: Demo_Narrative_Library_Browse_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Library_Browse_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Library_Browse_BodyInputs = {};
