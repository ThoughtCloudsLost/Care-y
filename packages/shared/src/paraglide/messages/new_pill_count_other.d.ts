/**
* | output |
* | --- |
* | "{count} new" |
*
* @param {New_Pill_Count_OtherInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const new_pill_count_other: ((inputs: New_Pill_Count_OtherInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<New_Pill_Count_OtherInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type New_Pill_Count_OtherInputs = {
    count: NonNullable<unknown>;
};
