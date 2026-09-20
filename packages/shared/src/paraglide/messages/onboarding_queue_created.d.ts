/**
* | output |
* | --- |
* | "{Queue} created." |
*
* @param {Onboarding_Queue_CreatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_queue_created: ((inputs: Onboarding_Queue_CreatedInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Queue_CreatedInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Queue_CreatedInputs = {
    Queue: NonNullable<unknown>;
};
