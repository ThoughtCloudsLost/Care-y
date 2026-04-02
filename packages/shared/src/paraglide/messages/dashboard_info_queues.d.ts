/**
* | output |
* | --- |
* | "Queues" |
*
* @param {Dashboard_Info_QueuesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_info_queues: ((inputs?: Dashboard_Info_QueuesInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Info_QueuesInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Info_QueuesInputs = {};
