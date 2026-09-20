/**
* | output |
* | --- |
* | "{count} deactivated" |
*
* @param {Admin_Users_Batch_DeactivatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_users_batch_deactivated: ((inputs: Admin_Users_Batch_DeactivatedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Users_Batch_DeactivatedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Users_Batch_DeactivatedInputs = {
    count: NonNullable<unknown>;
};
