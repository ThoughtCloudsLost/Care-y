/**
* | output |
* | --- |
* | "{count} templates" |
*
* @param {Admin_Hub_Badge_TemplatesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_hub_badge_templates: ((inputs: Admin_Hub_Badge_TemplatesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Hub_Badge_TemplatesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Hub_Badge_TemplatesInputs = {
    count: NonNullable<unknown>;
};
