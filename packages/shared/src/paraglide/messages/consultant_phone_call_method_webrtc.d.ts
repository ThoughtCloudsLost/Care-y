/**
* | output |
* | --- |
* | "Browser call" |
*
* @param {Consultant_Phone_Call_Method_WebrtcInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_call_method_webrtc: ((inputs?: Consultant_Phone_Call_Method_WebrtcInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Consultant_Phone_Call_Method_WebrtcInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Consultant_Phone_Call_Method_WebrtcInputs = {};
