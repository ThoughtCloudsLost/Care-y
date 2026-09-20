/**
* | output |
* | --- |
* | "When a secure link was created with a passphrase, the portal page shows a passphrase form before the thread, and the visitor enters the five word passphrase ..." |
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
