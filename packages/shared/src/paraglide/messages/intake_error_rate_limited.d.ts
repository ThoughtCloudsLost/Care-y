/**
* | output |
* | --- |
* | "Too many messages from this connection. Try again in about {minutes} minutes, or call us." |
*
* @param {Intake_Error_Rate_LimitedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_error_rate_limited: ((inputs: Intake_Error_Rate_LimitedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Error_Rate_LimitedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Error_Rate_LimitedInputs = {
    minutes: NonNullable<unknown>;
};
