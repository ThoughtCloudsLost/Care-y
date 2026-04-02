/**
* | output |
* | --- |
* | "{count} open" |
*
* @param {Dashboard_Queues_Open_CountInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_queues_open_count: ((inputs: Dashboard_Queues_Open_CountInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Queues_Open_CountInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Queues_Open_CountInputs = {
    count: NonNullable<unknown>;
};
