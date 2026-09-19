/**
* | output |
* | --- |
* | "Your recovery file predates this key. Export a new one to keep it current." |
*
* @param {Admin_Rotation_Reexport_EscrowInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_rotation_reexport_escrow: ((inputs?: Admin_Rotation_Reexport_EscrowInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Rotation_Reexport_EscrowInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Rotation_Reexport_EscrowInputs = {};
