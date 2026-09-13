/**
* | output |
* | --- |
* | "This form is no longer accepting submissions." |
*
* @param {Intake_Form_Closed_DefaultInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_form_closed_default: ((inputs?: Intake_Form_Closed_DefaultInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Form_Closed_DefaultInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Form_Closed_DefaultInputs = {};
