/**
* | output |
* | --- |
* | "Push notifications" |
*
* @param {Twofa_Push_Enroll_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_push_enroll_title: ((inputs?: Twofa_Push_Enroll_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Push_Enroll_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Push_Enroll_TitleInputs = {};
