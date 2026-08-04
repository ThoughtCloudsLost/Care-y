/**
* | output |
* | --- |
* | "Preset created" |
*
* @param {Audit_Event_Preset_CreatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_preset_created: ((inputs?: Audit_Event_Preset_CreatedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Preset_CreatedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Preset_CreatedInputs = {};
