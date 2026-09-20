/**
* | output |
* | --- |
* | "Invite not found or already used." |
*
* @param {Error_Invite_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_invite_not_found: ((inputs?: Error_Invite_Not_FoundInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Invite_Not_FoundInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Invite_Not_FoundInputs = {};
