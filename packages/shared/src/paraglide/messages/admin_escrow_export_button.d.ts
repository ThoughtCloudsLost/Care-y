/**
* | output |
* | --- |
* | "Create Escrow File" |
*
* @param {Admin_Escrow_Export_ButtonInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_export_button: ((inputs?: Admin_Escrow_Export_ButtonInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Escrow_Export_ButtonInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Escrow_Export_ButtonInputs = {};
