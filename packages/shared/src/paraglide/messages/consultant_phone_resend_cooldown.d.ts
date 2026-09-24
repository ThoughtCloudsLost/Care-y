/**
* | output |
* | --- |
* | "Resend in {seconds}s" |
*
* @param {Consultant_Phone_Resend_CooldownInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_resend_cooldown: ((inputs: Consultant_Phone_Resend_CooldownInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Consultant_Phone_Resend_CooldownInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Consultant_Phone_Resend_CooldownInputs = {
    seconds: NonNullable<unknown>;
};
