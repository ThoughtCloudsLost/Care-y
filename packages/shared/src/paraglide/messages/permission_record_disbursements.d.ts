/**
* | output |
* | --- |
* | "Record disbursements" |
*
* @param {Permission_Record_DisbursementsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const permission_record_disbursements: ((inputs?: Permission_Record_DisbursementsInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Record_DisbursementsInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Record_DisbursementsInputs = {};
