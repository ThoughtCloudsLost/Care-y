/**
* | output |
* | --- |
* | "Record adjustment" |
*
* @param {Admin_Funds_Record_AdjustmentInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_funds_record_adjustment: ((inputs?: Admin_Funds_Record_AdjustmentInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Funds_Record_AdjustmentInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Funds_Record_AdjustmentInputs = {};
