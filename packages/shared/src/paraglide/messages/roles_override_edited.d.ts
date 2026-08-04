/**
* | output |
* | --- |
* | "edited" |
*
* @param {Roles_Override_EditedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const roles_override_edited: ((inputs?: Roles_Override_EditedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Roles_Override_EditedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Roles_Override_EditedInputs = {};
