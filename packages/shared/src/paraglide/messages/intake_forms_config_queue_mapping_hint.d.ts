/**
* | output |
* | --- |
* | "Choose a destination queue for each option." |
*
* @param {Intake_Forms_Config_Queue_Mapping_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_queue_mapping_hint: ((inputs?: Intake_Forms_Config_Queue_Mapping_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Config_Queue_Mapping_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Config_Queue_Mapping_HintInputs = {};
