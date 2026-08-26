/**
* | output |
* | --- |
* | "This form is no longer accepting submissions." |
*
* @param {Error_Intake_Form_ClosedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_intake_form_closed: ((inputs?: Error_Intake_Form_ClosedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Intake_Form_ClosedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Intake_Form_ClosedInputs = {};
