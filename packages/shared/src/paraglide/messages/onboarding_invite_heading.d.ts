/**
* | output |
* | --- |
* | "Invite {Volunteers}" |
*
* @param {Onboarding_Invite_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_invite_heading: ((inputs: Onboarding_Invite_HeadingInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Invite_HeadingInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Invite_HeadingInputs = {
    Volunteers: NonNullable<unknown>;
    volunteers: NonNullable<unknown>;
};
