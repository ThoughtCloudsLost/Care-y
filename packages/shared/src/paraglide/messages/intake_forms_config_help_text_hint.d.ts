/**
* | output |
* | --- |
* | "Shown below the field on the public form." |
*
* @param {Intake_Forms_Config_Help_Text_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_help_text_hint: ((inputs?: Intake_Forms_Config_Help_Text_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Config_Help_Text_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Config_Help_Text_HintInputs = {};
