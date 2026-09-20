/**
* | output |
* | --- |
* | "Some records are still waiting to be re-encrypted. This finishes automatically the next time you sign in." |
*
* @param {Admin_Rotation_Reseal_PendingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_rotation_reseal_pending: ((inputs?: Admin_Rotation_Reseal_PendingInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Rotation_Reseal_PendingInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Rotation_Reseal_PendingInputs = {};
