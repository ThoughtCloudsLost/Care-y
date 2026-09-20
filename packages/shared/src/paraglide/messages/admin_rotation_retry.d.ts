/**
* | output |
* | --- |
* | "Retry" |
*
* @param {Admin_Rotation_RetryInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_rotation_retry: ((inputs?: Admin_Rotation_RetryInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Rotation_RetryInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Rotation_RetryInputs = {};
