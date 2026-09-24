/**
* | output |
* | --- |
* | "Deactivating will permanently destroy access to those tickets. No one else can decrypt them, and no recovery path exists." |
*
* @param {Admin_Deactivate_Sole_Holder_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_deactivate_sole_holder_body: ((inputs?: Admin_Deactivate_Sole_Holder_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Deactivate_Sole_Holder_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Deactivate_Sole_Holder_BodyInputs = {};
