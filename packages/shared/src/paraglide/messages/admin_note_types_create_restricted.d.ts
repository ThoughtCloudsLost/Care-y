/**
* | output |
* | --- |
* | "Create: {role}+" |
*
* @param {Admin_Note_Types_Create_RestrictedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_note_types_create_restricted: ((inputs: Admin_Note_Types_Create_RestrictedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Note_Types_Create_RestrictedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Note_Types_Create_RestrictedInputs = {
    role: NonNullable<unknown>;
};
