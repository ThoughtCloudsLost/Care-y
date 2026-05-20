/**
* | output |
* | --- |
* | "Comms" |
*
* @param {Onboarding_Step_CommunicationsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_step_communications: ((inputs?: Onboarding_Step_CommunicationsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Step_CommunicationsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Step_CommunicationsInputs = {};
