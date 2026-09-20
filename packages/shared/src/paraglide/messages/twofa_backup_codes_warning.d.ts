/**
* | output |
* | --- |
* | "Save these codes. They are shown only once." |
*
* @param {Twofa_Backup_Codes_WarningInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_backup_codes_warning: ((inputs?: Twofa_Backup_Codes_WarningInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Backup_Codes_WarningInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Backup_Codes_WarningInputs = {};
