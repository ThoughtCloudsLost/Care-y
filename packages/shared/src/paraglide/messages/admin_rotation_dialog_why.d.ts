/**
* | output |
* | --- |
* | "Rotate your key if a team member leaves the organization, if you suspect unauthorized access, or as part of a regular security schedule." |
*
* @param {Admin_Rotation_Dialog_WhyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_rotation_dialog_why: ((inputs?: Admin_Rotation_Dialog_WhyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Rotation_Dialog_WhyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Rotation_Dialog_WhyInputs = {};
