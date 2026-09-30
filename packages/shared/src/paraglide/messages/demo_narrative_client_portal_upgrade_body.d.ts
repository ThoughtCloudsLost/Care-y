/**
* | output |
* | --- |
* | "A client on a secure link can strengthen protection without involving the organization, either by adding a passphrase or by creating an account. [[#portal #p..." |
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
