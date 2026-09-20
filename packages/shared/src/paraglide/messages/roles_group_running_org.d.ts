/**
* | output |
* | --- |
* | "Running the organization" |
*
* @param {Roles_Group_Running_OrgInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const roles_group_running_org: ((inputs?: Roles_Group_Running_OrgInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Roles_Group_Running_OrgInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Roles_Group_Running_OrgInputs = {};
