/**
* | output |
* | --- |
* | "Global search opens over whatever the user is doing and answers from two lists before a word is typed: the searches made this session and the cases and artic..." |
*
* @param {Demo_Narrative_Search_Overlay_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_search_overlay_body: ((inputs?: Demo_Narrative_Search_Overlay_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Search_Overlay_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Search_Overlay_BodyInputs = {};
