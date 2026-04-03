/**
* | output |
* | --- |
* | "You have queue access but not the decryption key for this ticket. Ask an admin to re-wrap keys." |
*
* @param {Dashboard_Encrypted_HelpInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_encrypted_help: ((inputs?: Dashboard_Encrypted_HelpInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Encrypted_HelpInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Encrypted_HelpInputs = {};
