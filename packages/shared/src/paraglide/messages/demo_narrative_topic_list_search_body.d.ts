/**
* | output |
* | --- |
* | "A search control in the ticket list header opens a search bar below the filters. The search bar matches a term against the decrypted fields of each loaded ti..." |
*
* @param {Demo_Narrative_Topic_List_Search_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_list_search_body: ((inputs?: Demo_Narrative_Topic_List_Search_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_List_Search_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_List_Search_BodyInputs = {};
