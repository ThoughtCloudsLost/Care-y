/**
* | output |
* | --- |
* | "{count} numbers" |
*
* @param {Admin_Hub_Badge_PhonesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_hub_badge_phones: ((inputs: Admin_Hub_Badge_PhonesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Hub_Badge_PhonesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Hub_Badge_PhonesInputs = {
    count: NonNullable<unknown>;
};
