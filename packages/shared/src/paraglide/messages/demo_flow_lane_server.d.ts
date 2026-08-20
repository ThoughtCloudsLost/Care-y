/**
* | output |
* | --- |
* | "Server" |
*
* @param {Demo_Flow_Lane_ServerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_lane_server: ((inputs?: Demo_Flow_Lane_ServerInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Lane_ServerInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Lane_ServerInputs = {};
