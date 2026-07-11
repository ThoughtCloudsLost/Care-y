/**
* | output |
* | --- |
* | "{count} urgent" |
*
* @param {Dashboard_Queue_Urgent_OtherInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_queue_urgent_other: ((inputs: Dashboard_Queue_Urgent_OtherInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Queue_Urgent_OtherInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Queue_Urgent_OtherInputs = {
    count: NonNullable<unknown>;
};
