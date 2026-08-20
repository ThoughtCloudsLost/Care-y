/**
* | output |
* | --- |
* | "One moment, preparing the handbook. The app is signing in and deriving encryption keys, exactly as it would for a real volunteer." |
*
* @param {Demo_PreparingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_preparing: ((inputs?: Demo_PreparingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_PreparingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_PreparingInputs = {};
