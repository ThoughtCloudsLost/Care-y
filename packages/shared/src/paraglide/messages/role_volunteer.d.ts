/**
* | output |
* | --- |
* | "{Volunteer}" |
*
* @param {Role_VolunteerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const role_volunteer: ((inputs: Role_VolunteerInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Role_VolunteerInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Role_VolunteerInputs = {
    Volunteer: NonNullable<unknown>;
};
