/**
* | output |
* | --- |
* | "e.g. What is the best way to reach you?" |
*
* @param {Intake_Forms_Config_Label_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_label_placeholder: ((inputs?: Intake_Forms_Config_Label_PlaceholderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Config_Label_PlaceholderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Config_Label_PlaceholderInputs = {};
