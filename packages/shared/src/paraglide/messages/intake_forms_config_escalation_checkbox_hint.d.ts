/**
* | output |
* | --- |
* | "When checked, the form triggers an escalation alert." |
*
* @param {Intake_Forms_Config_Escalation_Checkbox_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_escalation_checkbox_hint: ((inputs?: Intake_Forms_Config_Escalation_Checkbox_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Config_Escalation_Checkbox_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Config_Escalation_Checkbox_HintInputs = {};
