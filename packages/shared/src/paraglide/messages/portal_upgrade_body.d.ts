/**
* | output |
* | --- |
* | "Your messages are encrypted, and the key travels inside your secure link. That also means anyone who gets your link can read them. You can protect them furth..." |
*
* @param {Portal_Upgrade_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_upgrade_body: ((inputs?: Portal_Upgrade_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Upgrade_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Upgrade_BodyInputs = {};
