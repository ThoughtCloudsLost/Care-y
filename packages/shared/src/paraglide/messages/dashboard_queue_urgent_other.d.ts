/**
* | output |
* | --- |
* | "{count} urgent" |
*
* @param {Dashboard_Queue_Urgent_OtherInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_queue_urgent_other: ((inputs: Dashboard_Queue_Urgent_OtherInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Queue_Urgent_OtherInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Queue_Urgent_OtherInputs = {
    count: NonNullable<unknown>;
};
