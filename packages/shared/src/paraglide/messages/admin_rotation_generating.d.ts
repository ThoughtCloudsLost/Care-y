/**
* | output |
* | --- |
* | "Generating new key..." |
*
* @param {Admin_Rotation_GeneratingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_rotation_generating: ((inputs?: Admin_Rotation_GeneratingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Rotation_GeneratingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Rotation_GeneratingInputs = {};
