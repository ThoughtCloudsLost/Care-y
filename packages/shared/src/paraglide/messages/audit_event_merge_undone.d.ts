/**
* | output |
* | --- |
* | "Merge undone" |
*
* @param {Audit_Event_Merge_UndoneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_merge_undone: ((inputs?: Audit_Event_Merge_UndoneInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Merge_UndoneInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Merge_UndoneInputs = {};
