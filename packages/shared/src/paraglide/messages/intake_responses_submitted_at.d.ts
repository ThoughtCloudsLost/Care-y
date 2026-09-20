/**
* | output |
* | --- |
* | "Submitted {date}" |
*
* @param {Intake_Responses_Submitted_AtInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_responses_submitted_at: ((inputs: Intake_Responses_Submitted_AtInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Responses_Submitted_AtInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Responses_Submitted_AtInputs = {
    date: NonNullable<unknown>;
};
