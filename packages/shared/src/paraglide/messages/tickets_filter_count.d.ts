/**
* | output |
* | --- |
* | "{label} ({count})" |
*
* @param {Tickets_Filter_CountInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_count: ((inputs: Tickets_Filter_CountInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Tickets_Filter_CountInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Tickets_Filter_CountInputs = {
    label: NonNullable<unknown>;
    count: NonNullable<unknown>;
};
