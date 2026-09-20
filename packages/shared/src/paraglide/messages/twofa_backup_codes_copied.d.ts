/**
* | output |
* | --- |
* | "Codes copied" |
*
* @param {Twofa_Backup_Codes_CopiedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_backup_codes_copied: ((inputs?: Twofa_Backup_Codes_CopiedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Backup_Codes_CopiedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Backup_Codes_CopiedInputs = {};
