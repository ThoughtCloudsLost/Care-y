/**
* | output |
* | --- |
* | "Phone callback" |
*
* @param {Consultant_Phone_Call_Method_CallbackInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_call_method_callback: ((inputs?: Consultant_Phone_Call_Method_CallbackInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Consultant_Phone_Call_Method_CallbackInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Consultant_Phone_Call_Method_CallbackInputs = {};
