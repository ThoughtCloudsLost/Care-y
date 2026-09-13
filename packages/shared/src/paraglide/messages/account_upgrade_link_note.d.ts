/**
* | output |
* | --- |
* | "This link will stop working after you set up your account." |
*
* @param {Account_Upgrade_Link_NoteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const account_upgrade_link_note: ((inputs?: Account_Upgrade_Link_NoteInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Account_Upgrade_Link_NoteInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Account_Upgrade_Link_NoteInputs = {};
