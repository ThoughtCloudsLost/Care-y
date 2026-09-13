/**
* | output |
* | --- |
* | "Phone callback" |
*
* @param {Consultant_Phone_Call_Method_CallbackInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_call_method_callback: ((inputs?: Consultant_Phone_Call_Method_CallbackInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Consultant_Phone_Call_Method_CallbackInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Consultant_Phone_Call_Method_CallbackInputs = {};
