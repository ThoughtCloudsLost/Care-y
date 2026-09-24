/**
* | output |
* | --- |
* | "A share link opens once, and the read is settled by a single conditional update, so one reader among several racing gets the content while the ciphertext col..." |
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
