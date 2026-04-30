/**
* | output |
* | --- |
* | "Too many setup attempts. Try again later." |
*
* @param {Error_Bootstrap_Rate_LimitedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_bootstrap_rate_limited: ((inputs?: Error_Bootstrap_Rate_LimitedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Bootstrap_Rate_LimitedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Bootstrap_Rate_LimitedInputs = {};
