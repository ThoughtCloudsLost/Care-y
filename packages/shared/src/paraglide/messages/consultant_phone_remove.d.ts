/**
* | output |
* | --- |
* | "Remove phone" |
*
* @param {Consultant_Phone_RemoveInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_remove: ((inputs?: Consultant_Phone_RemoveInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Consultant_Phone_RemoveInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Consultant_Phone_RemoveInputs = {};
