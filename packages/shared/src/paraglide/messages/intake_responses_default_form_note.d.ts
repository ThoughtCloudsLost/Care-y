/**
* | output |
* | --- |
* | "Default form submissions do not produce response rows. This viewer covers custom forms only." |
*
* @param {Intake_Responses_Default_Form_NoteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_responses_default_form_note: ((inputs?: Intake_Responses_Default_Form_NoteInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Responses_Default_Form_NoteInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Responses_Default_Form_NoteInputs = {};
