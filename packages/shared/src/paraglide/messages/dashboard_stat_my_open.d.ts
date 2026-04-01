/**
* | output |
* | --- |
* | "My Open" |
*
* @param {Dashboard_Stat_My_OpenInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_stat_my_open: ((inputs?: Dashboard_Stat_My_OpenInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Stat_My_OpenInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Stat_My_OpenInputs = {};
