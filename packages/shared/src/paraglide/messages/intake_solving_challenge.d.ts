/**
* | output |
* | --- |
* | "Securing your message..." |
*
* @param {Intake_Solving_ChallengeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_solving_challenge: ((inputs?: Intake_Solving_ChallengeInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Solving_ChallengeInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Solving_ChallengeInputs = {};
