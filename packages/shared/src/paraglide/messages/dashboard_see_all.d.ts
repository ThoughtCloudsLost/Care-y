/**
* | output |
* | --- |
* | "See all ({count})" |
*
* @param {Dashboard_See_AllInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_see_all: ((inputs: Dashboard_See_AllInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_See_AllInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_See_AllInputs = {
    count: NonNullable<unknown>;
};
