/**
* | output |
* | --- |
* | "The library lists all published articles grouped by category. Each article shows a decrypted title and excerpt, and both land scrambled and resolve into read..." |
*
* @param {Demo_Narrative_Library_Browse_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_library_browse_body: ((inputs?: Demo_Narrative_Library_Browse_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Library_Browse_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Library_Browse_BodyInputs = {};
