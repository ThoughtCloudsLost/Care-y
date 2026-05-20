/**
* | output |
* | --- |
* | "Logo, colors, and text shown to {volunteers} and {clients}." |
*
* @param {Admin_Branding_DescriptionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_branding_description: ((inputs: Admin_Branding_DescriptionInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Branding_DescriptionInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Branding_DescriptionInputs = {
    volunteers: NonNullable<unknown>;
    clients: NonNullable<unknown>;
};
