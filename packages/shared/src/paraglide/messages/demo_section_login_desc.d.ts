/**
* | output |
* | --- |
* | "The login screen is where a user signs in and where the browser turns the password into the encryption keys that make the organization's data readable. The e..." |
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
