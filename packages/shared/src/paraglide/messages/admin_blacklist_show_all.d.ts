/**
* | output |
* | --- |
* | "Show {count} more" |
*
* @param {Admin_Blacklist_Show_AllInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_blacklist_show_all: ((inputs: Admin_Blacklist_Show_AllInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Admin_Blacklist_Show_AllInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Admin_Blacklist_Show_AllInputs = {
    count: NonNullable<unknown>;
};
