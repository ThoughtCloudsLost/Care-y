/**
* | output |
* | --- |
* | "Intake form image uploaded" |
*
* @param {Audit_Event_Form_Asset_UploadedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_form_asset_uploaded: ((inputs?: Audit_Event_Form_Asset_UploadedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Form_Asset_UploadedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Form_Asset_UploadedInputs = {};
