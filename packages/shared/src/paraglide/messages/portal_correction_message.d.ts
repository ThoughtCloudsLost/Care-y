/**
* | output |
* | --- |
* | "Contact correction request. New phone number: {phone}" |
*
* @param {Portal_Correction_MessageInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_correction_message: ((inputs: Portal_Correction_MessageInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Portal_Correction_MessageInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Portal_Correction_MessageInputs = {
    phone: NonNullable<unknown>;
};
