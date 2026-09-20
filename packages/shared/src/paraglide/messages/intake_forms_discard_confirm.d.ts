/**
* | output |
* | --- |
* | "You have unsaved changes. Leave without saving?" |
*
* @param {Intake_Forms_Discard_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_discard_confirm: ((inputs?: Intake_Forms_Discard_ConfirmInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Discard_ConfirmInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Discard_ConfirmInputs = {};
