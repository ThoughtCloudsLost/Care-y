/**
* | output |
* | --- |
* | "The portal offers the client two ways to strengthen their link's security. **Add a passphrase.** The browser generates a random five word passphrase the clie..." |
*
* @param {Demo_Narrative_Client_Portal_Upgrade_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_portal_upgrade_body: ((inputs?: Demo_Narrative_Client_Portal_Upgrade_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Client_Portal_Upgrade_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Client_Portal_Upgrade_BodyInputs = {};
