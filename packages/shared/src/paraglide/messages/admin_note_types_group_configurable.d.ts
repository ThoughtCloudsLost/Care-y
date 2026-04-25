/**
* | output |
* | --- |
* | "Internal Note Types" |
*
* @param {Admin_Note_Types_Group_ConfigurableInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_group_configurable: ((inputs?: Admin_Note_Types_Group_ConfigurableInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Note_Types_Group_ConfigurableInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Note_Types_Group_ConfigurableInputs = {};
