/**
* | output |
* | --- |
* | "Your Role" |
*
* @param {Mgr_Section_RoleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const mgr_section_role: ((inputs?: Mgr_Section_RoleInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Mgr_Section_RoleInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Mgr_Section_RoleInputs = {};
