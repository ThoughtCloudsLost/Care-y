/**
* | output |
* | --- |
* | "Route calls to specialized teams with separate queues." |
*
* @param {Getting_Started_Queues_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const getting_started_queues_desc: ((inputs?: Getting_Started_Queues_DescInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Getting_Started_Queues_DescInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Getting_Started_Queues_DescInputs = {};
