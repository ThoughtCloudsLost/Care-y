/**
* | output |
* | --- |
* | "Revoke a reply link" |
*
* @param {Permission_Revoke_Reply_LinksInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_revoke_reply_links: ((inputs?: Permission_Revoke_Reply_LinksInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Revoke_Reply_LinksInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Revoke_Reply_LinksInputs = {};
