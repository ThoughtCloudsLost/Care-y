/**
* | output |
* | --- |
* | "Merge undone" |
*
* @param {Audit_Event_Merge_UndoneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_merge_undone: ((inputs?: Audit_Event_Merge_UndoneInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Merge_UndoneInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Merge_UndoneInputs = {};
