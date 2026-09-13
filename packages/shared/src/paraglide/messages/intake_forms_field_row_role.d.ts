/**
* | output |
* | --- |
* | "Role: {role}" |
*
* @param {Intake_Forms_Field_Row_RoleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_row_role: ((inputs: Intake_Forms_Field_Row_RoleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Field_Row_RoleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Field_Row_RoleInputs = {
    role: NonNullable<unknown>;
};
