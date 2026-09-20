/**
* | output |
* | --- |
* | "Person helped (singular)" |
*
* @param {Onboarding_Org_Term_Client_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const onboarding_org_term_client_label: ((inputs?: Onboarding_Org_Term_Client_LabelInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Org_Term_Client_LabelInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Org_Term_Client_LabelInputs = {};
