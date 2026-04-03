/**
* | output |
* | --- |
* | "in {queue}" |
*
* @param {Dashboard_Activity_In_QueueInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_activity_in_queue: ((inputs: Dashboard_Activity_In_QueueInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Activity_In_QueueInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Activity_In_QueueInputs = {
    queue: NonNullable<unknown>;
};
