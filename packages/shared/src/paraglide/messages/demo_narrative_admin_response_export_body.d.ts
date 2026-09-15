/**
* | output |
* | --- |
* | "The export button at the top of the response viewer opens a dialog for downloading the responses as a CSV file. **What is included.** The CSV contains every ..." |
*
* @param {Demo_Narrative_Admin_Response_Export_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_response_export_body: ((inputs?: Demo_Narrative_Admin_Response_Export_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Admin_Response_Export_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Admin_Response_Export_BodyInputs = {};
