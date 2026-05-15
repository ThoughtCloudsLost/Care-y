/**
* | output |
* | --- |
* | "Two-factor authentication" |
*
* @param {Twofa_Enroll_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_enroll_title: ((inputs?: Twofa_Enroll_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Enroll_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Enroll_TitleInputs = {};
