/**
* | output |
* | --- |
* | "Add a password or create an account to see the contact info on file." |
*
* @param {Error_Portal_Contact_LockedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_portal_contact_locked: ((inputs?: Error_Portal_Contact_LockedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Portal_Contact_LockedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Portal_Contact_LockedInputs = {};
