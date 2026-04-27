/**
* | output |
* | --- |
* | "Deactivate selected" |
*
* @param {Admin_Users_Batch_DeactivateInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_users_batch_deactivate: ((inputs?: Admin_Users_Batch_DeactivateInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Users_Batch_DeactivateInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Users_Batch_DeactivateInputs = {};
