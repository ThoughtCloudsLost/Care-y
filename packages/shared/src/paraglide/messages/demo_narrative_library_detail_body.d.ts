/**
* | output |
* | --- |
* | "The browser fetches the article's encrypted body from the server, decrypts it with the organization key, and strips anything that could run as code before re..." |
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
