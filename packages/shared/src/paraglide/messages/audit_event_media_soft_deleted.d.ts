/**
* | output |
* | --- |
* | "Media soft deleted" |
*
* @param {Audit_Event_Media_Soft_DeletedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_media_soft_deleted: ((inputs?: Audit_Event_Media_Soft_DeletedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Media_Soft_DeletedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Media_Soft_DeletedInputs = {};
