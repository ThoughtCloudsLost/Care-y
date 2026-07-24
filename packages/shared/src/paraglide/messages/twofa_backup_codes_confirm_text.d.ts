/**
* | output |
* | --- |
* | "These codes will not be shown again. Make sure you copied or wrote them down." |
*
* @param {Twofa_Backup_Codes_Confirm_TextInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_backup_codes_confirm_text: ((inputs?: Twofa_Backup_Codes_Confirm_TextInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Backup_Codes_Confirm_TextInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Backup_Codes_Confirm_TextInputs = {};
