/**
* | output |
* | --- |
* | "{count} open" |
*
* @param {Dashboard_Queues_Open_CountInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_queues_open_count: ((inputs: Dashboard_Queues_Open_CountInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Queues_Open_CountInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Queues_Open_CountInputs = {
    count: NonNullable<unknown>;
};
