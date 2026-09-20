/**
* | output |
* | --- |
* | "{count} responses" |
*
* @param {Intake_Responses_CountInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_responses_count: ((inputs: Intake_Responses_CountInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Responses_CountInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Responses_CountInputs = {
    count: NonNullable<unknown>;
};
