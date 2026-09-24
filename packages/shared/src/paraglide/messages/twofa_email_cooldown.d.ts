/**
* | output |
* | --- |
* | "Resend in {seconds}s" |
*
* @param {Twofa_Email_CooldownInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const twofa_email_cooldown: ((inputs: Twofa_Email_CooldownInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Email_CooldownInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Email_CooldownInputs = {
    seconds: NonNullable<unknown>;
};
