/**
* | output |
* | --- |
* | "This call routes through your phone provider. They can hear the call. Keep sensitive details in the encrypted chat." |
*
* @param {Exposure_Hint_CallInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const exposure_hint_call: ((inputs?: Exposure_Hint_CallInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Exposure_Hint_CallInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Exposure_Hint_CallInputs = {};
