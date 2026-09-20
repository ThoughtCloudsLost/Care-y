/**
* | output |
* | --- |
* | "Test push notification" |
*
* @param {Twofa_Push_Enroll_VerifyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_push_enroll_verify: ((inputs?: Twofa_Push_Enroll_VerifyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Push_Enroll_VerifyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Push_Enroll_VerifyInputs = {};
