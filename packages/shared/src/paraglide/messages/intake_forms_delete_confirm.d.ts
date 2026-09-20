/**
* | output |
* | --- |
* | "This will permanently delete this form and all its fields. This cannot be undone." |
*
* @param {Intake_Forms_Delete_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_delete_confirm: ((inputs?: Intake_Forms_Delete_ConfirmInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Delete_ConfirmInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Delete_ConfirmInputs = {};
