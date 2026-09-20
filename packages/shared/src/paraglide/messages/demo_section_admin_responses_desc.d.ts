/**
* | output |
* | --- |
* | "Responses are the one form artifact encrypted to private keys rather than the derivable key used for form definitions, and reading them requires a separate p..." |
*
* @param {Demo_Section_Admin_Responses_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_admin_responses_desc: ((inputs?: Demo_Section_Admin_Responses_DescInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Section_Admin_Responses_DescInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Section_Admin_Responses_DescInputs = {};
