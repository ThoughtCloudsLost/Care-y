/**
* | output |
* | --- |
* | "{count} new" |
*
* @param {New_Pill_Count_OneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const new_pill_count_one: ((inputs: New_Pill_Count_OneInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<New_Pill_Count_OneInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type New_Pill_Count_OneInputs = {
    count: NonNullable<unknown>;
};
