/**
* | output |
* | --- |
* | "A combination of active filters can be kept under a name and applied again in one step, either on the device alone or shared with the organization. [[#client..." |
*
* @param {Demo_Narrative_Topic_Saved_Filters_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_saved_filters_body: ((inputs?: Demo_Narrative_Topic_Saved_Filters_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Saved_Filters_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Saved_Filters_BodyInputs = {};
