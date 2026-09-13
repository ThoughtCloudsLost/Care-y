/**
* | output |
* | --- |
* | "Your link still works. Too many pages loaded in a short time, so loading is paused for a moment. This page will try again on its own; you can leave it open." |
*
* @param {Portal_Rate_Limited_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_rate_limited_body: ((inputs?: Portal_Rate_Limited_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Rate_Limited_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Rate_Limited_BodyInputs = {};
