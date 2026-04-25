/**
* | output |
* | --- |
* | "View: {role}+" |
*
* @param {Admin_Note_Types_View_RestrictedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_view_restricted: ((inputs: Admin_Note_Types_View_RestrictedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Note_Types_View_RestrictedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Note_Types_View_RestrictedInputs = {
    role: NonNullable<unknown>;
};
