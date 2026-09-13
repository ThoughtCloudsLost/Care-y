/**
* | output |
* | --- |
* | "Manage reply templates" |
*
* @param {Permission_Manage_PresetsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const permission_manage_presets: ((inputs?: Permission_Manage_PresetsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Permission_Manage_PresetsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Permission_Manage_PresetsInputs = {};
