/**
* | output |
* | --- |
* | "Your organization uses \"{Volunteer}\" and \"{Client}\" as role names. This briefing uses the default terms \"volunteer\" and \"client\" for clarity." |
*
* @param {Onboarding_Briefing_Terminology_NoteInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_briefing_terminology_note: ((inputs: Onboarding_Briefing_Terminology_NoteInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Briefing_Terminology_NoteInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Briefing_Terminology_NoteInputs = {
    Volunteer: NonNullable<unknown>;
    Client: NonNullable<unknown>;
};
