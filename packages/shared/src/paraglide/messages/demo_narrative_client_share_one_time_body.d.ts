/**
* | output |
* | --- |
* | "Each share link can be opened once. The first open gets the message and the server deletes it at that moment, so a second open gets an already-opened state i..." |
*
* @param {Demo_Narrative_Client_Share_One_Time_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_share_one_time_body: ((inputs?: Demo_Narrative_Client_Share_One_Time_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Client_Share_One_Time_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Client_Share_One_Time_BodyInputs = {};
