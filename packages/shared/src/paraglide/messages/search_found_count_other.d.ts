/**
* | output |
* | --- |
* | "{count} found" |
*
* @param {Search_Found_Count_OtherInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_found_count_other: ((inputs: Search_Found_Count_OtherInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Found_Count_OtherInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Found_Count_OtherInputs = {
    count: NonNullable<unknown>;
};
