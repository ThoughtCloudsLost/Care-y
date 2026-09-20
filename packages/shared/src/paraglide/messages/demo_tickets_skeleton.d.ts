/**
* | output |
* | --- |
* | "Loading encrypted tickets" |
*
* @param {Demo_Tickets_SkeletonInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_tickets_skeleton: ((inputs?: Demo_Tickets_SkeletonInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Tickets_SkeletonInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Tickets_SkeletonInputs = {};
