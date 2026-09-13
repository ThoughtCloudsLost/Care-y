/**
* | output |
* | --- |
* | "This is what {org} has on file to reach you." |
*
* @param {Portal_Contact_FooterInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_contact_footer: ((inputs: Portal_Contact_FooterInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Contact_FooterInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Contact_FooterInputs = {
    org: NonNullable<unknown>;
};
