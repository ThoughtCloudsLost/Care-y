/**
* | output |
* | --- |
* | "One query runs against cases, knowledge base articles and, for an account holding the Manage users permission, other accounts. While a case is open the query..." |
*
* @param {Demo_Narrative_Search_Entities_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_search_entities_body: ((inputs?: Demo_Narrative_Search_Entities_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Search_Entities_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Search_Entities_BodyInputs = {};
