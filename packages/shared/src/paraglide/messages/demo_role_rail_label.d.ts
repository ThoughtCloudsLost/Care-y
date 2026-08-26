/**
* | output |
* | --- |
* | "Role switcher" |
*
* @param {Demo_Role_Rail_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_role_rail_label: ((inputs?: Demo_Role_Rail_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Role_Rail_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Role_Rail_LabelInputs = {};
