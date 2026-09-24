/**
* | output |
* | --- |
* | "Nothing unlocked on this device matches \"{query}\"." |
*
* @param {Search_Empty_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_empty_body: ((inputs: Search_Empty_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Search_Empty_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Search_Empty_BodyInputs = {
    query: NonNullable<unknown>;
};
