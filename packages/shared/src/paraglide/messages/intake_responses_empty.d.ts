/**
* | output |
* | --- |
* | "No responses have been submitted for this form." |
*
* @param {Intake_Responses_EmptyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_responses_empty: ((inputs?: Intake_Responses_EmptyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Responses_EmptyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Responses_EmptyInputs = {};
