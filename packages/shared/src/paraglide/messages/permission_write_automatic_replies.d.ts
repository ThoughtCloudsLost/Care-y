/**
* | output |
* | --- |
* | "Write automatic replies" |
*
* @param {Permission_Write_Automatic_RepliesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_write_automatic_replies: ((inputs?: Permission_Write_Automatic_RepliesInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Write_Automatic_RepliesInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Write_Automatic_RepliesInputs = {};
