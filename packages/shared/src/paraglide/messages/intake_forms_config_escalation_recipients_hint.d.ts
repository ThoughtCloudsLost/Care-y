/**
* | output |
* | --- |
* | "Choose volunteers to notify when escalation triggers." |
*
* @param {Intake_Forms_Config_Escalation_Recipients_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_escalation_recipients_hint: ((inputs?: Intake_Forms_Config_Escalation_Recipients_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Config_Escalation_Recipients_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Config_Escalation_Recipients_HintInputs = {};
