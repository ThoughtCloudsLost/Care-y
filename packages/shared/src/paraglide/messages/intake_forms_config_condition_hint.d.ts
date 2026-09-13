/**
* | output |
* | --- |
* | "When set, this field only appears if the selected conditions are met." |
*
* @param {Intake_Forms_Config_Condition_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_condition_hint: ((inputs?: Intake_Forms_Config_Condition_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Config_Condition_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Config_Condition_HintInputs = {};
