/**
* | output |
* | --- |
* | "Test the file periodically: can you still find it and remember the passphrase?" |
*
* @param {Admin_Escrow_Storage_TestInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_storage_test: ((inputs?: Admin_Escrow_Storage_TestInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Escrow_Storage_TestInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Escrow_Storage_TestInputs = {};
