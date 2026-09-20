/**
* | output |
* | --- |
* | "Export recovery file" |
*
* @param {Admin_Rotation_Export_EscrowInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_rotation_export_escrow: ((inputs?: Admin_Rotation_Export_EscrowInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Rotation_Export_EscrowInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Rotation_Export_EscrowInputs = {};
