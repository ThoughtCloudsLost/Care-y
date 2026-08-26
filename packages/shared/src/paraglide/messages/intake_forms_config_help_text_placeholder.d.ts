/**
* | output |
* | --- |
* | "e.g. We will only use this to contact you." |
*
* @param {Intake_Forms_Config_Help_Text_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_help_text_placeholder: ((inputs?: Intake_Forms_Config_Help_Text_PlaceholderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Config_Help_Text_PlaceholderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Config_Help_Text_PlaceholderInputs = {};
