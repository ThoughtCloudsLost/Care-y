/**
* | output |
* | --- |
* | "Securing your message..." |
*
* @param {Intake_Solving_ChallengeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_solving_challenge: ((inputs?: Intake_Solving_ChallengeInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Solving_ChallengeInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Solving_ChallengeInputs = {};
