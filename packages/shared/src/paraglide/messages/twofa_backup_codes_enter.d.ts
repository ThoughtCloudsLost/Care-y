/**
* | output |
* | --- |
* | "Enter backup code" |
*
* @param {Twofa_Backup_Codes_EnterInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_backup_codes_enter: ((inputs?: Twofa_Backup_Codes_EnterInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Backup_Codes_EnterInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Backup_Codes_EnterInputs = {};
