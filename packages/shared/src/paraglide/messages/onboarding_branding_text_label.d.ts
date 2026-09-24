/**
* | output |
* | --- |
* | "{Client}-Facing Greeting" |
*
* @param {Onboarding_Branding_Text_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_branding_text_label: ((inputs: Onboarding_Branding_Text_LabelInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Branding_Text_LabelInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Branding_Text_LabelInputs = {
    Client: NonNullable<unknown>;
    clients: NonNullable<unknown>;
};
