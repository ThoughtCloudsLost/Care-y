/**
* | output |
* | --- |
* | "Global Search returns results from many different places in CARE-Y. **Tickets.** Matches on decrypted title, client alias, queue name, and assignee name. Ful..." |
*
* @param {Demo_Narrative_Search_Entities_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_search_entities_body: ((inputs?: Demo_Narrative_Search_Entities_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Search_Entities_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Search_Entities_BodyInputs = {};
