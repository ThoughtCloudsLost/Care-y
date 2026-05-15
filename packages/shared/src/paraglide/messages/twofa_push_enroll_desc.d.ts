/**
* | output |
* | --- |
* | "Verify that push notifications work on your device." |
*
* @param {Twofa_Push_Enroll_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_push_enroll_desc: ((inputs?: Twofa_Push_Enroll_DescInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Push_Enroll_DescInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Push_Enroll_DescInputs = {};
