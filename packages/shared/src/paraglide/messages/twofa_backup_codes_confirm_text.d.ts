/**
* | output |
* | --- |
* | "These codes will not be shown again. Make sure you copied or wrote them down." |
*
* @param {Twofa_Backup_Codes_Confirm_TextInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_backup_codes_confirm_text: ((inputs?: Twofa_Backup_Codes_Confirm_TextInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Backup_Codes_Confirm_TextInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Backup_Codes_Confirm_TextInputs = {};
