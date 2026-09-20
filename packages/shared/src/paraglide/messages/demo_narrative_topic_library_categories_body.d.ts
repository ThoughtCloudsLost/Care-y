/**
* | output |
* | --- |
* | "Administrators organize the knowledge library into categories. Each category name is encrypted with the organization key before storage, so a database breach..." |
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
