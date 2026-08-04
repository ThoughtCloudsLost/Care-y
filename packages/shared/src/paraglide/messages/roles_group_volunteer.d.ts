/**
* | output |
* | --- |
* | "Volunteer level" |
*
* @param {Roles_Group_VolunteerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const roles_group_volunteer: ((inputs?: Roles_Group_VolunteerInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Roles_Group_VolunteerInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Roles_Group_VolunteerInputs = {};
