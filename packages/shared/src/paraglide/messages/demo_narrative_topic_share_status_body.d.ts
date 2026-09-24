/**
* | output |
* | --- |
* | "A small status line appears beneath each share link message in the ticket thread. It shows the link icon, the label \"Share link,\" and the current status. **S..." |
*
* @param {Demo_Narrative_Topic_Share_Status_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_share_status_body: ((inputs?: Demo_Narrative_Topic_Share_Status_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Share_Status_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Share_Status_BodyInputs = {};
