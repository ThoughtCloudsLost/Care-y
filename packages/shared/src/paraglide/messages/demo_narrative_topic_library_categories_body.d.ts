/**
* | output |
* | --- |
* | "Administrators organize the knowledge library into categories from this sheet. Categories are stored as org-key-encrypted records, so a database breach revea..." |
*
* @param {Demo_Narrative_Topic_Library_Categories_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_library_categories_body: ((inputs?: Demo_Narrative_Topic_Library_Categories_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Library_Categories_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Library_Categories_BodyInputs = {};
