/**
* | output |
* | --- |
* | "No search term ever leaves the device. The browser matches the query against text it has already decrypted, which is why a query about case content can run a..." |
*
* @param {Demo_Narrative_Search_How_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_search_how_body: ((inputs?: Demo_Narrative_Search_How_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Search_How_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Search_How_BodyInputs = {};
