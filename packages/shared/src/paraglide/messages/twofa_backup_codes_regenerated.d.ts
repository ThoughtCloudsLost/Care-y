/**
* | output |
* | --- |
* | "Your previous backup codes are now invalid." |
*
* @param {Twofa_Backup_Codes_RegeneratedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_backup_codes_regenerated: ((inputs?: Twofa_Backup_Codes_RegeneratedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Backup_Codes_RegeneratedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Backup_Codes_RegeneratedInputs = {};
