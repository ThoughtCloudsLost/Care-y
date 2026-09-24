/**
* | output |
* | --- |
* | "API" |
*
* @param {Demo_Flow_Lane_TrpcInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_lane_trpc: ((inputs?: Demo_Flow_Lane_TrpcInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Lane_TrpcInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Lane_TrpcInputs = {};
