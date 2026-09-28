/**
* | output |
* | --- |
* | "Personal data removed by retention policy" |
*
* @param {Audit_Event_Pii_Retention_PurgeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_pii_retention_purge: ((inputs?: Audit_Event_Pii_Retention_PurgeInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Pii_Retention_PurgeInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Pii_Retention_PurgeInputs = {};
