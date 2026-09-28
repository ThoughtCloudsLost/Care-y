/**
* | output |
* | --- |
* | "Records re-encrypted" |
*
* @param {Audit_Event_Org_Key_ResealInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_org_key_reseal: ((inputs?: Audit_Event_Org_Key_ResealInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Org_Key_ResealInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Org_Key_ResealInputs = {};
