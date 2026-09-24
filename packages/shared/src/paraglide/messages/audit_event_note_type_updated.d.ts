/**
* | output |
* | --- |
* | "Note type updated" |
*
* @param {Audit_Event_Note_Type_UpdatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_note_type_updated: ((inputs?: Audit_Event_Note_Type_UpdatedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Note_Type_UpdatedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Note_Type_UpdatedInputs = {};
