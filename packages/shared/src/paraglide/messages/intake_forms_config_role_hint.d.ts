/**
* | output |
* | --- |
* | "Controls how the system treats the answer. Roles cover contact matching, queue routing, urgency, and safety handling." |
*
* @param {Intake_Forms_Config_Role_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_role_hint: ((inputs?: Intake_Forms_Config_Role_HintInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Config_Role_HintInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Config_Role_HintInputs = {};
