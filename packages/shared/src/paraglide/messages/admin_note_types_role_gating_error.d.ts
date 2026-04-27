/**
* | output |
* | --- |
* | "The create role must be equal to or higher than the view role." |
*
* @param {Admin_Note_Types_Role_Gating_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_role_gating_error: ((inputs?: Admin_Note_Types_Role_Gating_ErrorInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Note_Types_Role_Gating_ErrorInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Note_Types_Role_Gating_ErrorInputs = {};
