/**
* | output |
* | --- |
* | "Invite User" |
*
* @param {Create_Invite_UserInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const create_invite_user: ((inputs?: Create_Invite_UserInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Create_Invite_UserInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Create_Invite_UserInputs = {};
