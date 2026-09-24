/**
* | output |
* | --- |
* | "Manage share links" |
*
* @param {Permission_Manage_Share_LinksInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_manage_share_links: ((inputs?: Permission_Manage_Share_LinksInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Manage_Share_LinksInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Manage_Share_LinksInputs = {};
