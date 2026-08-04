/**
* | output |
* | --- |
* | "These stay with Admin to protect keys and roles." |
*
* @param {Roles_Locked_ExplainerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const roles_locked_explainer: ((inputs?: Roles_Locked_ExplainerInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Roles_Locked_ExplainerInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Roles_Locked_ExplainerInputs = {};
