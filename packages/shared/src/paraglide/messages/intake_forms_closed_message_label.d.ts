/**
* | output |
* | --- |
* | "Closed message" |
*
* @param {Intake_Forms_Closed_Message_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_closed_message_label: ((inputs?: Intake_Forms_Closed_Message_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Closed_Message_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Closed_Message_LabelInputs = {};
