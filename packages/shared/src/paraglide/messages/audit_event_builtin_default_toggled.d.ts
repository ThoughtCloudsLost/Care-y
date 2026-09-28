/**
* | output |
* | --- |
* | "Built-in default form toggled" |
*
* @param {Audit_Event_Builtin_Default_ToggledInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_builtin_default_toggled: ((inputs?: Audit_Event_Builtin_Default_ToggledInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Builtin_Default_ToggledInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Builtin_Default_ToggledInputs = {};
