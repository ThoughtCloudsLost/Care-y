/**
* | output |
* | --- |
* | "We send a 6-digit code to your email each time you log in. Convenient, but only as secure as your email account. Anyone who can read your email can receive t..." |
*
* @param {Twofa_Email_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_email_desc: ((inputs?: Twofa_Email_DescInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Email_DescInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Email_DescInputs = {};
