/**
* | output |
* | --- |
* | "Give a copy to a trusted second person (board member, co-director)" |
*
* @param {Admin_Escrow_Storage_CopyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_storage_copy: ((inputs?: Admin_Escrow_Storage_CopyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Escrow_Storage_CopyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Escrow_Storage_CopyInputs = {};
