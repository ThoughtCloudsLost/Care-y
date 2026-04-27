/**
* | output |
* | --- |
* | "Creating escrow file..." |
*
* @param {Admin_Escrow_ExportingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_exporting: ((inputs?: Admin_Escrow_ExportingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Escrow_ExportingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Escrow_ExportingInputs = {};
