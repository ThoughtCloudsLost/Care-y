/**
* | output |
* | --- |
* | "Manage users, roles, and invitations" |
*
* @param {Hub_Users_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const hub_users_subtitle: ((inputs?: Hub_Users_SubtitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Hub_Users_SubtitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Hub_Users_SubtitleInputs = {};
