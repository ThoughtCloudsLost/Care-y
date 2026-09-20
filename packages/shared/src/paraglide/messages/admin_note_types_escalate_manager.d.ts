/**
* | output |
* | --- |
* | "{Manager}" |
*
* @param {Admin_Note_Types_Escalate_ManagerInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_escalate_manager: ((inputs: Admin_Note_Types_Escalate_ManagerInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Note_Types_Escalate_ManagerInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Note_Types_Escalate_ManagerInputs = {
    Manager: NonNullable<unknown>;
};
