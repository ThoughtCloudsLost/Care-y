/**
* | output |
* | --- |
* | "Confirm passphrase" |
*
* @param {Admin_Escrow_Confirm_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_confirm_label: ((inputs?: Admin_Escrow_Confirm_LabelInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Escrow_Confirm_LabelInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Escrow_Confirm_LabelInputs = {};
