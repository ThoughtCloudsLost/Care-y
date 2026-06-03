/**
* | output |
* | --- |
* | "Shown to {volunteers} and {clients}." |
*
* @param {Admin_Branding_Name_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_branding_name_hint: ((inputs: Admin_Branding_Name_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Branding_Name_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Branding_Name_HintInputs = {
    volunteers: NonNullable<unknown>;
    clients: NonNullable<unknown>;
};
