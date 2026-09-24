/**
* | output |
* | --- |
* | "Submitted" |
*
* @param {Intake_Responses_Csv_Submitted_HeaderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_responses_csv_submitted_header: ((inputs?: Intake_Responses_Csv_Submitted_HeaderInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Responses_Csv_Submitted_HeaderInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Responses_Csv_Submitted_HeaderInputs = {};
