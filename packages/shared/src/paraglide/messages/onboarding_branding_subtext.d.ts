/**
* | output |
* | --- |
* | "Customize how your organization appears to {volunteers} and {clients}. You can change these later." |
*
* @param {Onboarding_Branding_SubtextInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_branding_subtext: ((inputs: Onboarding_Branding_SubtextInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Branding_SubtextInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Branding_SubtextInputs = {
    volunteers: NonNullable<unknown>;
    clients: NonNullable<unknown>;
};
