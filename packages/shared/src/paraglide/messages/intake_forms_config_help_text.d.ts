/**
* | output |
* | --- |
* | "Help text" |
*
* @param {Intake_Forms_Config_Help_TextInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_help_text: ((inputs?: Intake_Forms_Config_Help_TextInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Config_Help_TextInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Config_Help_TextInputs = {};
