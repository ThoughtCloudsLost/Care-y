/**
* | output |
* | --- |
* | "Your link now also needs the password you just set. Anyone who only has the link will not be able to read your messages." |
*
* @param {Portal_Passphrase_Success_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_passphrase_success_body: ((inputs?: Portal_Passphrase_Success_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Passphrase_Success_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Passphrase_Success_BodyInputs = {};
