/**
* | output |
* | --- |
* | "Closing a ticket records that the work on it is finished. Reopening puts the ticket back in the working lists. Both require the Change case status permission..." |
*
* @param {Demo_Narrative_Topic_Close_Reopen_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_close_reopen_body: ((inputs?: Demo_Narrative_Topic_Close_Reopen_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Close_Reopen_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Close_Reopen_BodyInputs = {};
