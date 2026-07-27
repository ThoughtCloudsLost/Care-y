/**
* | output |
* | --- |
* | "Authentication in CARE-Y protects more than your account. The login flow derives the encryption keys that guard every piece of data in the system. No passwor..." |
*
* @param {Demo_Section_Login_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_login_desc: ((inputs?: Demo_Section_Login_DescInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Section_Login_DescInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Section_Login_DescInputs = {};
