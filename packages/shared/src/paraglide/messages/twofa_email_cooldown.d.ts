/**
* | output |
* | --- |
* | "Resend in {seconds}s" |
*
* @param {Twofa_Email_CooldownInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const twofa_email_cooldown: ((inputs: Twofa_Email_CooldownInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Twofa_Email_CooldownInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Twofa_Email_CooldownInputs = {
    seconds: NonNullable<unknown>;
};
