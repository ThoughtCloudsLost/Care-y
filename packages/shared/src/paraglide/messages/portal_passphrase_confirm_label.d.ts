/**
* | output |
* | --- |
* | "Confirm password" |
*
* @param {Portal_Passphrase_Confirm_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_passphrase_confirm_label: ((inputs?: Portal_Passphrase_Confirm_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Passphrase_Confirm_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Passphrase_Confirm_LabelInputs = {};
