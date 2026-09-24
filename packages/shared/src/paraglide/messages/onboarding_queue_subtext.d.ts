/**
* | output |
* | --- |
* | "{Queues} organize incoming cases by topic or team." |
*
* @param {Onboarding_Queue_SubtextInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_queue_subtext: ((inputs: Onboarding_Queue_SubtextInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Queue_SubtextInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Queue_SubtextInputs = {
    Queues: NonNullable<unknown>;
    queues: NonNullable<unknown>;
};
