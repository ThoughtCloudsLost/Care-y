/**
* | output |
* | --- |
* | "The share page tells the reader that the link carried the decryption key, that the server cannot read the content, and that the link works only once. The not..." |
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
