/**
* | output |
* | --- |
* | "Default (form destination)" |
*
* @param {Intake_Forms_Config_Queue_DefaultInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_queue_default: ((inputs?: Intake_Forms_Config_Queue_DefaultInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Config_Queue_DefaultInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Config_Queue_DefaultInputs = {};
