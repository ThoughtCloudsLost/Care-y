/**
* | output |
* | --- |
* | "Use a long, memorable phrase. Example: four or more random words like 'morning river quiet lantern'. Longer is always better." |
*
* @param {Admin_Escrow_Passphrase_GuidanceInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_passphrase_guidance: ((inputs?: Admin_Escrow_Passphrase_GuidanceInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Escrow_Passphrase_GuidanceInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Escrow_Passphrase_GuidanceInputs = {};
