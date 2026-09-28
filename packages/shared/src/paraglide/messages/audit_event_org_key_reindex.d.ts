/**
* | output |
* | --- |
* | "Record index rebuilt" |
*
* @param {Audit_Event_Org_Key_ReindexInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_org_key_reindex: ((inputs?: Audit_Event_Org_Key_ReindexInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Org_Key_ReindexInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Org_Key_ReindexInputs = {};
