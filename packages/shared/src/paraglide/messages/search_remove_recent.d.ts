/**
* | output |
* | --- |
* | "Remove" |
*
* @param {Search_Remove_RecentInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_remove_recent: ((inputs?: Search_Remove_RecentInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Remove_RecentInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Remove_RecentInputs = {};
