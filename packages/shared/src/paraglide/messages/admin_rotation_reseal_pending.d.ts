/**
* | output |
* | --- |
* | "Some records are still waiting to be re-encrypted. This finishes automatically the next time you sign in." |
*
* @param {Admin_Rotation_Reseal_PendingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_rotation_reseal_pending: ((inputs?: Admin_Rotation_Reseal_PendingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Rotation_Reseal_PendingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Rotation_Reseal_PendingInputs = {};
