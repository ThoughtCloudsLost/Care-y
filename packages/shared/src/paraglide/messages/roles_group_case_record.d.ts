/**
* | output |
* | --- |
* | "The case record" |
*
* @param {Roles_Group_Case_RecordInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const roles_group_case_record: ((inputs?: Roles_Group_Case_RecordInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Roles_Group_Case_RecordInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Roles_Group_Case_RecordInputs = {};
