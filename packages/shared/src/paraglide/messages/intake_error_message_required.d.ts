/**
* | output |
* | --- |
* | "Please write a message so we know how to help." |
*
* @param {Intake_Error_Message_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_error_message_required: ((inputs?: Intake_Error_Message_RequiredInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Error_Message_RequiredInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Error_Message_RequiredInputs = {};
