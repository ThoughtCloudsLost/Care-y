/**
* | output |
* | --- |
* | "{count} backup codes remaining" |
*
* @param {Twofa_Backup_Codes_RemainingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_backup_codes_remaining: ((inputs: Twofa_Backup_Codes_RemainingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Backup_Codes_RemainingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Backup_Codes_RemainingInputs = {
    count: NonNullable<unknown>;
};
