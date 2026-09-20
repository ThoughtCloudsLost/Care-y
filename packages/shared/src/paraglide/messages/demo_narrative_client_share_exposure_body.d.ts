/**
* | output |
* | --- |
* | "**Privacy.** The server cannot read the share content because the decryption key lives in the URL fragment, which the browser never sends in a request. The s..." |
*
* @param {Demo_Narrative_Client_Share_Exposure_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_share_exposure_body: ((inputs?: Demo_Narrative_Client_Share_Exposure_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Client_Share_Exposure_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Client_Share_Exposure_BodyInputs = {};
