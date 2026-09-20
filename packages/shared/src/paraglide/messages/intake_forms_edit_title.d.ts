/**
* | output |
* | --- |
* | "Edit Form" |
*
* @param {Intake_Forms_Edit_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_edit_title: ((inputs?: Intake_Forms_Edit_TitleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Edit_TitleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Edit_TitleInputs = {};
