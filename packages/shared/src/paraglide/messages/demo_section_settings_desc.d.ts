/**
* | output |
* | --- |
* | "The settings page lets volunteers update their profile, change their password, and manage notification preferences." |
*
* @param {Demo_Section_Settings_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_section_settings_desc: ((inputs?: Demo_Section_Settings_DescInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Section_Settings_DescInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Section_Settings_DescInputs = {};
