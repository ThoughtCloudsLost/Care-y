/**
* | output |
* | --- |
* | "Push notifications" |
*
* @param {Twofa_Push_Enroll_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_push_enroll_title: ((inputs?: Twofa_Push_Enroll_TitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Push_Enroll_TitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Push_Enroll_TitleInputs = {};
