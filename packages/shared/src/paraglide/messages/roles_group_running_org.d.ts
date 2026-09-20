/**
* | output |
* | --- |
* | "Running the organization" |
*
* @param {Roles_Group_Running_OrgInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const roles_group_running_org: ((inputs?: Roles_Group_Running_OrgInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Roles_Group_Running_OrgInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Roles_Group_Running_OrgInputs = {};
