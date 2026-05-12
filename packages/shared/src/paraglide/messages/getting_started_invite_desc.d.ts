/**
* | output |
* | --- |
* | "Share invite links so your team can create accounts." |
*
* @param {Getting_Started_Invite_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const getting_started_invite_desc: ((inputs?: Getting_Started_Invite_DescInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Getting_Started_Invite_DescInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Getting_Started_Invite_DescInputs = {};
