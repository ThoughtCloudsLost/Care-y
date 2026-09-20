/**
* | output |
* | --- |
* | "Passphrase" |
*
* @param {Admin_Escrow_Passphrase_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_passphrase_label: ((inputs?: Admin_Escrow_Passphrase_LabelInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Escrow_Passphrase_LabelInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Escrow_Passphrase_LabelInputs = {};
