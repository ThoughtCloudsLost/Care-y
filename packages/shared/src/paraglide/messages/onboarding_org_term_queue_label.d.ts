/**
* | output |
* | --- |
* | "Work group (singular)" |
*
* @param {Onboarding_Org_Term_Queue_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_org_term_queue_label: ((inputs?: Onboarding_Org_Term_Queue_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Org_Term_Queue_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Org_Term_Queue_LabelInputs = {};
