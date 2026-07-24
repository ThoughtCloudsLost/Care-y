/**
* | output |
* | --- |
* | "{count} new" |
*
* @param {New_Pill_Count_OneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const new_pill_count_one: ((inputs: New_Pill_Count_OneInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<New_Pill_Count_OneInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type New_Pill_Count_OneInputs = {
    count: NonNullable<unknown>;
};
