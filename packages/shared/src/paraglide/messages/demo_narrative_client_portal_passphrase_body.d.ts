/**
* | output |
* | --- |
* | "When a secure link carries a passphrase, the client enters it before any message is decrypted. The passphrase exists only in the browser of the user who crea..." |
*
* @param {Demo_Narrative_Client_Portal_Passphrase_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_portal_passphrase_body: ((inputs?: Demo_Narrative_Client_Portal_Passphrase_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Client_Portal_Passphrase_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Client_Portal_Passphrase_BodyInputs = {};
