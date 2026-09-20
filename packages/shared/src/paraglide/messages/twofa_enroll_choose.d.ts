/**
* | output |
* | --- |
* | "Add a verification method" |
*
* @param {Twofa_Enroll_ChooseInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_enroll_choose: ((inputs?: Twofa_Enroll_ChooseInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Enroll_ChooseInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Enroll_ChooseInputs = {};
