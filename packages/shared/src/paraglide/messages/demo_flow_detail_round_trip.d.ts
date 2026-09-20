/**
* | output |
* | --- |
* | "Round trip" |
*
* @param {Demo_Flow_Detail_Round_TripInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_detail_round_trip: ((inputs?: Demo_Flow_Detail_Round_TripInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Flow_Detail_Round_TripInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Flow_Detail_Round_TripInputs = {};
