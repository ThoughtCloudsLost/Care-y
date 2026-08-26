/**
* | output |
* | --- |
* | "Handled by {name}" |
*
* @param {Contact_Correction_Handled_ByInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const contact_correction_handled_by: ((inputs: Contact_Correction_Handled_ByInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Contact_Correction_Handled_ByInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Contact_Correction_Handled_ByInputs = {
    name: NonNullable<unknown>;
};
