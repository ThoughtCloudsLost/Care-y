/**
* | output |
* | --- |
* | "One moment, preparing the handbook. The app is signing in and deriving encryption keys in the background." |
*
* @param {Demo_PreparingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_preparing: ((inputs?: Demo_PreparingInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_PreparingInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_PreparingInputs = {};
