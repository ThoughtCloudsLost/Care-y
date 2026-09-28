/**
* | output |
* | --- |
* | "The intake form is where someone without an account asks for help. A built-in default ships with every organization, and custom forms can replace it with dif..." |
*
* @param {Demo_Section_Client_Intake_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_client_intake_desc: ((inputs?: Demo_Section_Client_Intake_DescInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Section_Client_Intake_DescInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Section_Client_Intake_DescInputs = {};
