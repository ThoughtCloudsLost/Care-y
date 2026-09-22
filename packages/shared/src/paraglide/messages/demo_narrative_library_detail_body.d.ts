/**
* | output |
* | --- |
* | "Opening an article fetches the one thing the list does not carry, its encrypted body, and decrypts it in the crypto worker before rendering it through a sani..." |
*
* @param {Demo_Narrative_Library_Detail_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_library_detail_body: ((inputs?: Demo_Narrative_Library_Detail_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Library_Detail_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Library_Detail_BodyInputs = {};
