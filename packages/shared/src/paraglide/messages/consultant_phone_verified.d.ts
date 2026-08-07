/**
* | output |
* | --- |
* | "Verified" |
*
* @param {Consultant_Phone_VerifiedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_verified: ((inputs?: Consultant_Phone_VerifiedInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Consultant_Phone_VerifiedInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Consultant_Phone_VerifiedInputs = {};
