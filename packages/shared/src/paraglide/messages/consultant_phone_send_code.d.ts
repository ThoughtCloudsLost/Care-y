/**
* | output |
* | --- |
* | "Send code" |
*
* @param {Consultant_Phone_Send_CodeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_send_code: ((inputs?: Consultant_Phone_Send_CodeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Consultant_Phone_Send_CodeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Consultant_Phone_Send_CodeInputs = {};
