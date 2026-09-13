/**
* | output |
* | --- |
* | "Add option" |
*
* @param {Intake_Forms_Config_Add_OptionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_add_option: ((inputs?: Intake_Forms_Config_Add_OptionInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Config_Add_OptionInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Config_Add_OptionInputs = {};
