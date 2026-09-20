/**
* | output |
* | --- |
* | "Invite User" |
*
* @param {Create_Invite_UserInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const create_invite_user: ((inputs?: Create_Invite_UserInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Create_Invite_UserInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Create_Invite_UserInputs = {};
