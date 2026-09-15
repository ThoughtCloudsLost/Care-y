/**
* | output |
* | --- |
* | "Intake" |
*
* @param {Roles_Group_IntakeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const roles_group_intake: ((inputs?: Roles_Group_IntakeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Roles_Group_IntakeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Roles_Group_IntakeInputs = {};
