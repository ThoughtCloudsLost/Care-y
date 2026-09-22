/**
* | output |
* | --- |
* | "Searching this page matches what the browser has already decrypted and steps through the matches one at a time without leaving the list. [[#client-data #priv..." |
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
