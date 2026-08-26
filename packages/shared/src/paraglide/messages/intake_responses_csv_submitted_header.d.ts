/**
* | output |
* | --- |
* | "Submitted" |
*
* @param {Intake_Responses_Csv_Submitted_HeaderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_responses_csv_submitted_header: ((inputs?: Intake_Responses_Csv_Submitted_HeaderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Responses_Csv_Submitted_HeaderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Responses_Csv_Submitted_HeaderInputs = {};
