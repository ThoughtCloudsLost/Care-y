/**
* | output |
* | --- |
* | "Phone number" |
*
* @param {Intake_Forms_Config_Subtype_PhoneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_subtype_phone: ((inputs?: Intake_Forms_Config_Subtype_PhoneInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Config_Subtype_PhoneInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Config_Subtype_PhoneInputs = {};
