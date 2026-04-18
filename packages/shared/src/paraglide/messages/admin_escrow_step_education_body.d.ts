/**
* | output |
* | --- |
* | "Your organization's data is encrypted with a key that only your team can access. If all administrators lose access to their accounts, this file is the only w..." |
*
* @param {Admin_Escrow_Step_Education_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_escrow_step_education_body: ((inputs?: Admin_Escrow_Step_Education_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Escrow_Step_Education_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Escrow_Step_Education_BodyInputs = {};
