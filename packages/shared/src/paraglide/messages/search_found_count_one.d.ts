/**
* | output |
* | --- |
* | "{count} found" |
*
* @param {Search_Found_Count_OneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const search_found_count_one: ((inputs: Search_Found_Count_OneInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Found_Count_OneInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Found_Count_OneInputs = {
    count: NonNullable<unknown>;
};
