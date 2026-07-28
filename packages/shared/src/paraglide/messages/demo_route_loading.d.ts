/**
* | output |
* | --- |
* | "One moment, loading this screen. This short wait happens only in the browser demo, not in the installed app." |
*
* @param {Demo_Route_LoadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_route_loading: ((inputs?: Demo_Route_LoadingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Route_LoadingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Route_LoadingInputs = {};
