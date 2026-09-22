/**
* | output |
* | --- |
* | "A ticket carries an unread count when someone other than the user has replied to it since the user last read it. [[#client-data]] **How a reply is counted as..." |
*
* @param {Demo_Narrative_Topic_Unread_Badges_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_unread_badges_body: ((inputs?: Demo_Narrative_Topic_Unread_Badges_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Unread_Badges_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Unread_Badges_BodyInputs = {};
