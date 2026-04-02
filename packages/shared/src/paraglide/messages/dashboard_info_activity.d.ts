/**
* | output |
* | --- |
* | "Recent" |
*
* @param {Dashboard_Info_ActivityInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_info_activity: ((inputs?: Dashboard_Info_ActivityInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Info_ActivityInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Info_ActivityInputs = {};
