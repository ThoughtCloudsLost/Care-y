/**
* | output |
* | --- |
* | "Export CSV" |
*
* @param {Intake_Responses_Export_CsvInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_responses_export_csv: ((inputs?: Intake_Responses_Export_CsvInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Responses_Export_CsvInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Responses_Export_CsvInputs = {};
