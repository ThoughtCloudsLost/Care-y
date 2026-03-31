/**
* | output |
* | --- |
* | "A notification pops up on your phone asking you to approve the login. You just tap \"Yes, that's me\" to get in. It works because someone would need access to ..." |
*
* @param {Twofa_Push_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_push_desc: ((inputs?: Twofa_Push_DescInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Push_DescInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Push_DescInputs = {};
