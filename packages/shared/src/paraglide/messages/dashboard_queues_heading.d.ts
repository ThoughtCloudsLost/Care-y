/**
* | output |
* | --- |
* | "{Queues}" |
*
* @param {Dashboard_Queues_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_queues_heading: ((inputs: Dashboard_Queues_HeadingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_Queues_HeadingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_Queues_HeadingInputs = {
    Queues: NonNullable<unknown>;
};
