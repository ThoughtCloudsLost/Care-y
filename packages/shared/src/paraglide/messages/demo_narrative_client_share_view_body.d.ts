/**
* | output |
* | --- |
* | "Opening a share link fetches one encrypted message from the server and decrypts it on the reader's own device, with no account, no sign-in and nothing to ins..." |
*
* @param {Demo_Narrative_Client_Share_View_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_share_view_body: ((inputs?: Demo_Narrative_Client_Share_View_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Client_Share_View_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Client_Share_View_BodyInputs = {};
