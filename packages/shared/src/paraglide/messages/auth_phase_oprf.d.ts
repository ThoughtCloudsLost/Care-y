/**
* | output |
* | --- |
* | "Verifying with security server..." |
*
* @param {Auth_Phase_OprfInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const auth_phase_oprf: ((inputs?: Auth_Phase_OprfInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Auth_Phase_OprfInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Auth_Phase_OprfInputs = {};
