/**
* | output |
* | --- |
* | "Choose a verification method" |
*
* @param {Twofa_Verify_Method_PickerInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_verify_method_picker: ((inputs?: Twofa_Verify_Method_PickerInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Verify_Method_PickerInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Verify_Method_PickerInputs = {};
