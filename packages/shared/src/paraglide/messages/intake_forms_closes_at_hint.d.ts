/**
* | output |
* | --- |
* | "After this date and time, the form will stop accepting submissions." |
*
* @param {Intake_Forms_Closes_At_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_closes_at_hint: ((inputs?: Intake_Forms_Closes_At_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Closes_At_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Closes_At_HintInputs = {};
