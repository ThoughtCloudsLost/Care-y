/**
* | output |
* | --- |
* | "{count} {queues}" |
*
* @param {Tickets_Filter_Summary_Queues_OtherInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_summary_queues_other: ((inputs: Tickets_Filter_Summary_Queues_OtherInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Filter_Summary_Queues_OtherInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Filter_Summary_Queues_OtherInputs = {
    count: NonNullable<unknown>;
    queues: NonNullable<unknown>;
};
