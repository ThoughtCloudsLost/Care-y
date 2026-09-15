/**
* | output |
* | --- |
* | "The intake form is the public entry point for people seeking help. Every organization has a built-in default form, and administrators can publish custom form..." |
*
* @param {Demo_Section_Client_Intake_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_client_intake_desc: ((inputs?: Demo_Section_Client_Intake_DescInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Section_Client_Intake_DescInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Section_Client_Intake_DescInputs = {};
