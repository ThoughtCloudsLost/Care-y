/**
* | output |
* | --- |
* | "Could not send the code. Try again later." |
*
* @param {Consultant_Phone_Error_ProviderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_error_provider: ((inputs?: Consultant_Phone_Error_ProviderInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Consultant_Phone_Error_ProviderInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Consultant_Phone_Error_ProviderInputs = {};
