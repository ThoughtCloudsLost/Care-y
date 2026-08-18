/**
* | output |
* | --- |
* | "Allow specific dates" |
*
* @param {Intake_Forms_Config_Allow_SpecificInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_allow_specific: ((inputs?: Intake_Forms_Config_Allow_SpecificInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Config_Allow_SpecificInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Config_Allow_SpecificInputs = {};
