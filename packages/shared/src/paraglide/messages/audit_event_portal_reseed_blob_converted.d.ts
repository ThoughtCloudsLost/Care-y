/**
* | output |
* | --- |
* | "Media file converted for secure link" |
*
* @param {Audit_Event_Portal_Reseed_Blob_ConvertedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_portal_reseed_blob_converted: ((inputs?: Audit_Event_Portal_Reseed_Blob_ConvertedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Portal_Reseed_Blob_ConvertedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Portal_Reseed_Blob_ConvertedInputs = {};
