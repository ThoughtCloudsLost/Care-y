/**
* | output |
* | --- |
* | "Queue routing needs a question with one answer. Checkboxes let someone pick several options, and a case goes to a single queue, so the routing here would be ..." |
*
* @param {Intake_Forms_Config_Role_Conflict_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_config_role_conflict_body: ((inputs?: Intake_Forms_Config_Role_Conflict_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Forms_Config_Role_Conflict_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Forms_Config_Role_Conflict_BodyInputs = {};
