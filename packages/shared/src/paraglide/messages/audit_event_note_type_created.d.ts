/**
* | output |
* | --- |
* | "Note type created" |
*
* @param {Audit_Event_Note_Type_CreatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_note_type_created: ((inputs?: Audit_Event_Note_Type_CreatedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Note_Type_CreatedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Note_Type_CreatedInputs = {};
