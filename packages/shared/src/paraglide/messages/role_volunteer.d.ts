/**
* | output |
* | --- |
* | "{Volunteer}" |
*
* @param {Role_VolunteerInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const role_volunteer: ((inputs: Role_VolunteerInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Role_VolunteerInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Role_VolunteerInputs = {
    Volunteer: NonNullable<unknown>;
};
