/**
* | output |
* | --- |
* | "Preset updated" |
*
* @param {Audit_Event_Preset_UpdatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_preset_updated: ((inputs?: Audit_Event_Preset_UpdatedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Preset_UpdatedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Preset_UpdatedInputs = {};
