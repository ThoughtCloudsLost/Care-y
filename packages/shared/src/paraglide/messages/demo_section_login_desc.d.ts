/**
* | output |
* | --- |
* | "The login screen is where volunteers sign in and where CARE-Y derives the encryption keys that protect all data in the system. Volunteers enter a username an..." |
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
