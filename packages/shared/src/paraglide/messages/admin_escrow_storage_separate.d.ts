/**
* | output |
* | --- |
* | "Write the passphrase down separately from the USB" |
*
* @param {Admin_Escrow_Storage_SeparateInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_storage_separate: ((inputs?: Admin_Escrow_Storage_SeparateInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Escrow_Storage_SeparateInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Escrow_Storage_SeparateInputs = {};
