/**
* | output |
* | --- |
* | "{count}+" |
*
* @param {Count_At_LeastInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const count_at_least: ((inputs: Count_At_LeastInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Count_At_LeastInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Count_At_LeastInputs = {
    count: NonNullable<unknown>;
};
