/**
* | output |
* | --- |
* | "This will download a CSV file containing plaintext client data. The file is not encrypted. {exportedCount} responses will be exported." |
*
* @param {Intake_Responses_Export_Confirm_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_responses_export_confirm_body: ((inputs: Intake_Responses_Export_Confirm_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Responses_Export_Confirm_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Responses_Export_Confirm_BodyInputs = {
    exportedCount: NonNullable<unknown>;
};
