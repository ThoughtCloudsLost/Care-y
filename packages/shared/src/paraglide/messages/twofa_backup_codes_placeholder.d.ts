/**
* | output |
* | --- |
* | "xxxxxxxx" |
*
* @param {Twofa_Backup_Codes_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_backup_codes_placeholder: ((inputs?: Twofa_Backup_Codes_PlaceholderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Backup_Codes_PlaceholderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Backup_Codes_PlaceholderInputs = {};
