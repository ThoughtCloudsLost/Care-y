/**
* | output |
* | --- |
* | "Export CSV" |
*
* @param {Intake_Responses_Export_CsvInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_responses_export_csv: ((inputs?: Intake_Responses_Export_CsvInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Responses_Export_CsvInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Responses_Export_CsvInputs = {};
