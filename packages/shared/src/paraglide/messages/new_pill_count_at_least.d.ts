/**
* | output |
* | --- |
* | "{count}+ new" |
*
* @param {New_Pill_Count_At_LeastInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const new_pill_count_at_least: ((inputs: New_Pill_Count_At_LeastInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<New_Pill_Count_At_LeastInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type New_Pill_Count_At_LeastInputs = {
    count: NonNullable<unknown>;
};
