/**
* | output |
* | --- |
* | "Too many codes sent. Try again later." |
*
* @param {Consultant_Phone_Error_Rate_LimitedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_error_rate_limited: ((inputs?: Consultant_Phone_Error_Rate_LimitedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Consultant_Phone_Error_Rate_LimitedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Consultant_Phone_Error_Rate_LimitedInputs = {};
