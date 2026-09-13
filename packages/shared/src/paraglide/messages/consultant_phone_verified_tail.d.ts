/**
* | output |
* | --- |
* | "***{tail}" |
*
* @param {Consultant_Phone_Verified_TailInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_verified_tail: ((inputs: Consultant_Phone_Verified_TailInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Consultant_Phone_Verified_TailInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Consultant_Phone_Verified_TailInputs = {
    tail: NonNullable<unknown>;
};
