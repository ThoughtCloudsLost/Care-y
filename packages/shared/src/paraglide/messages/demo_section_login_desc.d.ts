/**
* | output |
* | --- |
* | "How your credentials protect case data before it reaches the server." |
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
