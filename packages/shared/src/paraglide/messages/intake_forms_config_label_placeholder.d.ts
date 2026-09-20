/**
* | output |
* | --- |
* | "e.g. What is the best way to reach you?" |
*
* @param {Intake_Forms_Config_Label_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_label_placeholder: ((inputs?: Intake_Forms_Config_Label_PlaceholderInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Config_Label_PlaceholderInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Config_Label_PlaceholderInputs = {};
