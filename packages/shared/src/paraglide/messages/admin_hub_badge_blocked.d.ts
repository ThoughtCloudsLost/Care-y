/**
* | output |
* | --- |
* | "{count} blocked" |
*
* @param {Admin_Hub_Badge_BlockedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_hub_badge_blocked: ((inputs: Admin_Hub_Badge_BlockedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Hub_Badge_BlockedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Hub_Badge_BlockedInputs = {
    count: NonNullable<unknown>;
};
