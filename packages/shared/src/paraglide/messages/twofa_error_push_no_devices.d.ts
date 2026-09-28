/**
* | output |
* | --- |
* | "No device is set up to receive sign-in requests. Choose another method." |
*
* @param {Twofa_Error_Push_No_DevicesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_error_push_no_devices: ((inputs?: Twofa_Error_Push_No_DevicesInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Error_Push_No_DevicesInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Error_Push_No_DevicesInputs = {};
