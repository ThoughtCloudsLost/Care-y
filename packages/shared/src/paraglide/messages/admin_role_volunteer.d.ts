/**
* | output |
* | --- |
* | "{Volunteer}" |
*
* @param {Admin_Role_VolunteerInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_role_volunteer: ((inputs: Admin_Role_VolunteerInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Role_VolunteerInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Role_VolunteerInputs = {
    Volunteer: NonNullable<unknown>;
};
