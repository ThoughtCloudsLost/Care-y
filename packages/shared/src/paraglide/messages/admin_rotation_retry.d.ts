/**
* | output |
* | --- |
* | "Retry" |
*
* @param {Admin_Rotation_RetryInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_rotation_retry: ((inputs?: Admin_Rotation_RetryInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Rotation_RetryInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Rotation_RetryInputs = {};
