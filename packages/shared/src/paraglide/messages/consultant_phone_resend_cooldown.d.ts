/**
* | output |
* | --- |
* | "Resend in {seconds}s" |
*
* @param {Consultant_Phone_Resend_CooldownInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_resend_cooldown: ((inputs: Consultant_Phone_Resend_CooldownInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Consultant_Phone_Resend_CooldownInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Consultant_Phone_Resend_CooldownInputs = {
    seconds: NonNullable<unknown>;
};
