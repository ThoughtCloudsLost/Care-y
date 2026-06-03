/**
* | output |
* | --- |
* | "Test push notification" |
*
* @param {Twofa_Push_Enroll_VerifyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_push_enroll_verify: ((inputs?: Twofa_Push_Enroll_VerifyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Push_Enroll_VerifyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Push_Enroll_VerifyInputs = {};
