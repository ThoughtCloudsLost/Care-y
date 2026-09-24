/**
* | output |
* | --- |
* | "{label} ({count})" |
*
* @param {Tickets_Filter_CountInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_count: ((inputs: Tickets_Filter_CountInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Filter_CountInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Filter_CountInputs = {
    label: NonNullable<unknown>;
    count: NonNullable<unknown>;
};
