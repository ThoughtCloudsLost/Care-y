/**
* | output |
* | --- |
* | "{Queue} name is required." |
*
* @param {Onboarding_Queue_Error_Name_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_queue_error_name_required: ((inputs: Onboarding_Queue_Error_Name_RequiredInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Queue_Error_Name_RequiredInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Queue_Error_Name_RequiredInputs = {
    Queue: NonNullable<unknown>;
    queue: NonNullable<unknown>;
};
