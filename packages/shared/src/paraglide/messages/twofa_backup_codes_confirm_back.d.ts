/**
* | output |
* | --- |
* | "Go back" |
*
* @param {Twofa_Backup_Codes_Confirm_BackInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_backup_codes_confirm_back: ((inputs?: Twofa_Backup_Codes_Confirm_BackInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Backup_Codes_Confirm_BackInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Backup_Codes_Confirm_BackInputs = {};
