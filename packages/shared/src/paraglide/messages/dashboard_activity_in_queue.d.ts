/**
* | output |
* | --- |
* | "in {queueName}" |
*
* @param {Dashboard_Activity_In_QueueInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_activity_in_queue: ((inputs: Dashboard_Activity_In_QueueInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Activity_In_QueueInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Activity_In_QueueInputs = {
    queueName: NonNullable<unknown>;
};
