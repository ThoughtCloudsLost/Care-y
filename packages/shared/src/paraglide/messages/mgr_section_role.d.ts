/**
* | output |
* | --- |
* | "Your Role" |
*
* @param {Mgr_Section_RoleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const mgr_section_role: ((inputs?: Mgr_Section_RoleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Mgr_Section_RoleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Mgr_Section_RoleInputs = {};
