/**
* | output |
* | --- |
* | "Unlocking your keys..." |
*
* @param {Auth_Phase_DeriveInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const auth_phase_derive: ((inputs?: Auth_Phase_DeriveInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Auth_Phase_DeriveInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Auth_Phase_DeriveInputs = {};
