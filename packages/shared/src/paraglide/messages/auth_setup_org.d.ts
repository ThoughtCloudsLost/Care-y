/**
* | output |
* | --- |
* | "Set up your organization" |
*
* @param {Auth_Setup_OrgInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const auth_setup_org: ((inputs?: Auth_Setup_OrgInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Auth_Setup_OrgInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Auth_Setup_OrgInputs = {};
