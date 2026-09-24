/**
* | output |
* | --- |
* | "People in your organization who handle cases and support clients." |
*
* @param {Admin_Terminology_Desc_VolunteerInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_terminology_desc_volunteer: ((inputs?: Admin_Terminology_Desc_VolunteerInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Terminology_Desc_VolunteerInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Terminology_Desc_VolunteerInputs = {};
