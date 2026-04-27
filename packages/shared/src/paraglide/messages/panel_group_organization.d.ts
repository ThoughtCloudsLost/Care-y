/**
* | output |
* | --- |
* | "Organization" |
*
* @param {Panel_Group_OrganizationInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const panel_group_organization: ((inputs?: Panel_Group_OrganizationInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Panel_Group_OrganizationInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Panel_Group_OrganizationInputs = {};
