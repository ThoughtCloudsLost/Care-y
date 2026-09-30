/**
* | output |
* | --- |
* | "The settings section covers what the user controls about their own account and device. Display names and language preferences are sealed to the organization ..." |
*
* @param {Demo_Section_Settings_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_section_settings_desc: ((inputs?: Demo_Section_Settings_DescInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Section_Settings_DescInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Section_Settings_DescInputs = {};
