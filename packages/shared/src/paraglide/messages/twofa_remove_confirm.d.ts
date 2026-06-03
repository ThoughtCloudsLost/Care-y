/**
* | output |
* | --- |
* | "Remove this method?" |
*
* @param {Twofa_Remove_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_remove_confirm: ((inputs?: Twofa_Remove_ConfirmInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Remove_ConfirmInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Remove_ConfirmInputs = {};
