/**
* | output |
* | --- |
* | "When someone opens a share link, the page fetches the encrypted content from the server and decrypts it in the browser. **How the link works.** The share ID ..." |
*
* @param {Demo_Narrative_Client_Share_View_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_share_view_body: ((inputs?: Demo_Narrative_Client_Share_View_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Client_Share_View_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Client_Share_View_BodyInputs = {};
