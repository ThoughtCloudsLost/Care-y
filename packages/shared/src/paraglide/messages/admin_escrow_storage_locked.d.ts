/**
* | output |
* | --- |
* | "Keep the USB in a locked location (safe, locked drawer)" |
*
* @param {Admin_Escrow_Storage_LockedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_storage_locked: ((inputs?: Admin_Escrow_Storage_LockedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Escrow_Storage_LockedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Escrow_Storage_LockedInputs = {};
