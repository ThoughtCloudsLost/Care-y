/**
* | output |
* | --- |
* | "No backup codes available." |
*
* @param {Error_No_Backup_CodesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_no_backup_codes: ((inputs?: Error_No_Backup_CodesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_No_Backup_CodesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_No_Backup_CodesInputs = {};
