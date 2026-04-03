/**
* | output |
* | --- |
* | "See all ({count})" |
*
* @param {Dashboard_See_AllInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_see_all: ((inputs: Dashboard_See_AllInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Dashboard_See_AllInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Dashboard_See_AllInputs = {
    count: NonNullable<unknown>;
};
