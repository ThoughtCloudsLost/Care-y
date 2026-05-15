/**
* | output |
* | --- |
* | "Add a verification method" |
*
* @param {Twofa_Enroll_ChooseInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_enroll_choose: ((inputs?: Twofa_Enroll_ChooseInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Enroll_ChooseInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Enroll_ChooseInputs = {};
