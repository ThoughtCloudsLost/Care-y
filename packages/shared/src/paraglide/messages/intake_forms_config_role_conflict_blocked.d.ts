/**
* | output |
* | --- |
* | "Change this question to Dropdown, or set the role to None, before you finish." |
*
* @param {Intake_Forms_Config_Role_Conflict_BlockedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_role_conflict_blocked: ((inputs?: Intake_Forms_Config_Role_Conflict_BlockedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Config_Role_Conflict_BlockedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Config_Role_Conflict_BlockedInputs = {};
