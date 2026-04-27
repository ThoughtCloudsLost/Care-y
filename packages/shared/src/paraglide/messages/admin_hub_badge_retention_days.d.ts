/**
* | output |
* | --- |
* | "{count} days" |
*
* @param {Admin_Hub_Badge_Retention_DaysInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_hub_badge_retention_days: ((inputs: Admin_Hub_Badge_Retention_DaysInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Hub_Badge_Retention_DaysInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Hub_Badge_Retention_DaysInputs = {
    count: NonNullable<unknown>;
};
