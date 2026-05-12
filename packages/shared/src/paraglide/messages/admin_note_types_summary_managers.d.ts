/**
* | output |
* | --- |
* | "{managers}" |
*
* @param {Admin_Note_Types_Summary_ManagersInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_summary_managers: ((inputs: Admin_Note_Types_Summary_ManagersInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Note_Types_Summary_ManagersInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Note_Types_Summary_ManagersInputs = {
    managers: NonNullable<unknown>;
};
