/**
* | output |
* | --- |
* | "Verifying with security server..." |
*
* @param {Auth_Phase_OprfInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const auth_phase_oprf: ((inputs?: Auth_Phase_OprfInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Auth_Phase_OprfInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Auth_Phase_OprfInputs = {};
