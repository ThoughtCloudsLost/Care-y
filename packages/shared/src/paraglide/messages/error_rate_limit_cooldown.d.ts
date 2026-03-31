/**
* | output |
* | --- |
* | "Please wait before requesting another code." |
*
* @param {Error_Rate_Limit_CooldownInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_rate_limit_cooldown: ((inputs?: Error_Rate_Limit_CooldownInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Error_Rate_Limit_CooldownInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Error_Rate_Limit_CooldownInputs = {};
