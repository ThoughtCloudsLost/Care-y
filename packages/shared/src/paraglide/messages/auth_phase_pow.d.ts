/**
* | output |
* | --- |
* | "Completing verification..." |
*
* @param {Auth_Phase_PowInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const auth_phase_pow: ((inputs?: Auth_Phase_PowInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Auth_Phase_PowInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Auth_Phase_PowInputs = {};
