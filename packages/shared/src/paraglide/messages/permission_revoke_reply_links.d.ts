/**
* | output |
* | --- |
* | "Revoke reply links" |
*
* @param {Permission_Revoke_Reply_LinksInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_revoke_reply_links: ((inputs?: Permission_Revoke_Reply_LinksInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Revoke_Reply_LinksInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Revoke_Reply_LinksInputs = {};
