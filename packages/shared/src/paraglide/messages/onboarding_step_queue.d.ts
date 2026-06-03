/**
* | output |
* | --- |
* | "{Queue}" |
*
* @param {Onboarding_Step_QueueInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_step_queue: ((inputs: Onboarding_Step_QueueInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Step_QueueInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Step_QueueInputs = {
    Queue: NonNullable<unknown>;
};
