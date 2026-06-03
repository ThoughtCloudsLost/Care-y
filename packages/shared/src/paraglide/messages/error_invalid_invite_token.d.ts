/**
* | output |
* | --- |
* | "This invite link is invalid or has expired." |
*
* @param {Error_Invalid_Invite_TokenInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_invalid_invite_token: ((inputs?: Error_Invalid_Invite_TokenInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Invalid_Invite_TokenInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Invalid_Invite_TokenInputs = {};
