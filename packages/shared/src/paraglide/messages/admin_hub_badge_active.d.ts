/**
* | output |
* | --- |
* | "{count} active" |
*
* @param {Admin_Hub_Badge_ActiveInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_hub_badge_active: ((inputs: Admin_Hub_Badge_ActiveInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Hub_Badge_ActiveInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Hub_Badge_ActiveInputs = {
    count: NonNullable<unknown>;
};
