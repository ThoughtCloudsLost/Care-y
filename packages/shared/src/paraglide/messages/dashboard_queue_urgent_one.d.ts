/**
* | output |
* | --- |
* | "{count} urgent" |
*
* @param {Dashboard_Queue_Urgent_OneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_queue_urgent_one: ((inputs: Dashboard_Queue_Urgent_OneInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Queue_Urgent_OneInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Queue_Urgent_OneInputs = {
    count: NonNullable<unknown>;
};
