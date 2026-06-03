/**
* | output |
* | --- |
* | "Enter backup code" |
*
* @param {Twofa_Backup_Codes_EnterInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_backup_codes_enter: ((inputs?: Twofa_Backup_Codes_EnterInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Backup_Codes_EnterInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Backup_Codes_EnterInputs = {};
