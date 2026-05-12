/**
* | output |
* | --- |
* | "{Queue} Name" |
*
* @param {Onboarding_Queue_Name_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_queue_name_label: ((inputs: Onboarding_Queue_Name_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Queue_Name_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Queue_Name_LabelInputs = {
    Queue: NonNullable<unknown>;
    queue: NonNullable<unknown>;
};
