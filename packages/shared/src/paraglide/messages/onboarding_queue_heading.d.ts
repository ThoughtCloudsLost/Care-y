/**
* | output |
* | --- |
* | "Create Your First {Queue}" |
*
* @param {Onboarding_Queue_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_queue_heading: ((inputs: Onboarding_Queue_HeadingInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Queue_HeadingInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Queue_HeadingInputs = {
    Queue: NonNullable<unknown>;
    queue: NonNullable<unknown>;
};
