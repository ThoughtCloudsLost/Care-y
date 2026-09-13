/**
* | output |
* | --- |
* | "Displayed when the form's closing date has passed." |
*
* @param {Intake_Forms_Closed_Message_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_closed_message_hint: ((inputs?: Intake_Forms_Closed_Message_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Closed_Message_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Closed_Message_HintInputs = {};
