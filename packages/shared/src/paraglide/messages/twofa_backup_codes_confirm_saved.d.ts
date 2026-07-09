/**
* | output |
* | --- |
* | "I saved them" |
*
* @param {Twofa_Backup_Codes_Confirm_SavedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_backup_codes_confirm_saved: ((inputs?: Twofa_Backup_Codes_Confirm_SavedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Backup_Codes_Confirm_SavedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Backup_Codes_Confirm_SavedInputs = {};
