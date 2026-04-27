/**
* | output |
* | --- |
* | "Save to a USB drive, not your computer or cloud storage" |
*
* @param {Admin_Escrow_Storage_UsbInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_storage_usb: ((inputs?: Admin_Escrow_Storage_UsbInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Escrow_Storage_UsbInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Escrow_Storage_UsbInputs = {};
