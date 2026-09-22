/**
* | output |
* | --- |
* | "Every article belongs to exactly one category, and categories are the organization's own vocabulary rather than a fixed set. Creating, renaming, reordering a..." |
*
* @param {Demo_Narrative_Topic_Library_Categories_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_library_categories_body: ((inputs?: Demo_Narrative_Topic_Library_Categories_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Library_Categories_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Library_Categories_BodyInputs = {};
