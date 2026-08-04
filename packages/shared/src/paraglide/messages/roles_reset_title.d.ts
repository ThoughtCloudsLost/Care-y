/**
* | output |
* | --- |
* | "Reset role permissions?" |
*
* @param {Roles_Reset_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const roles_reset_title: ((inputs?: Roles_Reset_TitleInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Roles_Reset_TitleInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Roles_Reset_TitleInputs = {};
