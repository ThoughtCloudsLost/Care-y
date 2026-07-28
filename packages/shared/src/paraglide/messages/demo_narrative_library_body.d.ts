/**
* | output |
* | --- |
* | "The library stores articles that volunteers can reference during calls. Each article body is encrypted with the organization key before it reaches the databa..." |
*
* @param {Demo_Narrative_Library_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_library_body: ((inputs?: Demo_Narrative_Library_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Library_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Library_BodyInputs = {};
