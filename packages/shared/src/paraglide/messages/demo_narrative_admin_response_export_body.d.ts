/**
* | output |
* | --- |
* | "The export button opens a dialog for downloading the current form's responses as a CSV file. The CSV is assembled entirely in the browser from responses that..." |
*
* @param {Demo_Narrative_Admin_Response_Export_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_response_export_body: ((inputs?: Demo_Narrative_Admin_Response_Export_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Response_Export_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Response_Export_BodyInputs = {};
