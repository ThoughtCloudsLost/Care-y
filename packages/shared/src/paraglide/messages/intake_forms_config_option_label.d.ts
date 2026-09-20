/**
* | output |
* | --- |
* | "Option {n}" |
*
* @param {Intake_Forms_Config_Option_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_option_label: ((inputs: Intake_Forms_Config_Option_LabelInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Config_Option_LabelInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Config_Option_LabelInputs = {
    n: NonNullable<unknown>;
};
