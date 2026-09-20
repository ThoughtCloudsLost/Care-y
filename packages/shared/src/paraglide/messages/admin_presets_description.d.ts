/**
* | output |
* | --- |
* | "Saved replies appear in the compose bar when {volunteers} write to {clients}. Titles and content are encrypted with the organization key." |
*
* @param {Admin_Presets_DescriptionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_presets_description: ((inputs: Admin_Presets_DescriptionInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Presets_DescriptionInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Presets_DescriptionInputs = {
    volunteers: NonNullable<unknown>;
    clients: NonNullable<unknown>;
};
