/**
* | output |
* | --- |
* | "Remove" |
*
* @param {Twofa_Remove_Confirm_YesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_remove_confirm_yes: ((inputs?: Twofa_Remove_Confirm_YesInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Remove_Confirm_YesInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Remove_Confirm_YesInputs = {};
