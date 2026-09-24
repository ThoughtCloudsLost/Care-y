/**
* | output |
* | --- |
* | "Role: {role}" |
*
* @param {Intake_Forms_Field_Row_RoleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_field_row_role: ((inputs: Intake_Forms_Field_Row_RoleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Field_Row_RoleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Field_Row_RoleInputs = {
    role: NonNullable<unknown>;
};
