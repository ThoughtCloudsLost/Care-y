/**
* | output |
* | --- |
* | "These stay with Admin to protect keys and roles." |
*
* @param {Roles_Locked_ExplainerInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const roles_locked_explainer: ((inputs?: Roles_Locked_ExplainerInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Roles_Locked_ExplainerInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Roles_Locked_ExplainerInputs = {};
