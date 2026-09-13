/**
* | output |
* | --- |
* | "Language preference" |
*
* @param {Intake_Forms_Config_Role_Language_PreferenceInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_role_language_preference: ((inputs?: Intake_Forms_Config_Role_Language_PreferenceInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Config_Role_Language_PreferenceInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Config_Role_Language_PreferenceInputs = {};
