/**
* | output |
* | --- |
* | "Email address" |
*
* @param {Intake_Forms_Config_Subtype_EmailInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_subtype_email: ((inputs?: Intake_Forms_Config_Subtype_EmailInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Config_Subtype_EmailInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Config_Subtype_EmailInputs = {};
