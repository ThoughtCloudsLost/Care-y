/**
* | output |
* | --- |
* | "Each share link works only once. After the content has been shown, the server deletes the ciphertext in the same transaction that records the open, so the en..." |
*
* @param {Demo_Narrative_Client_Share_One_Time_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_share_one_time_body: ((inputs?: Demo_Narrative_Client_Share_One_Time_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Client_Share_One_Time_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Client_Share_One_Time_BodyInputs = {};
