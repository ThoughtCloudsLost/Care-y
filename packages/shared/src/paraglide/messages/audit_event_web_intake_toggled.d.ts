/**
* | output |
* | --- |
* | "Web intake toggled" |
*
* @param {Audit_Event_Web_Intake_ToggledInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const audit_event_web_intake_toggled: ((inputs?: Audit_Event_Web_Intake_ToggledInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Audit_Event_Web_Intake_ToggledInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Audit_Event_Web_Intake_ToggledInputs = {};
