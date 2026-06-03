/**
* | output |
* | --- |
* | "Choose a verification method" |
*
* @param {Twofa_Verify_Method_PickerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_verify_method_picker: ((inputs?: Twofa_Verify_Method_PickerInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Verify_Method_PickerInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Verify_Method_PickerInputs = {};
