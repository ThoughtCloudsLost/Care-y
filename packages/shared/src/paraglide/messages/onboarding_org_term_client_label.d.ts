/**
* | output |
* | --- |
* | "Person helped (singular)" |
*
* @param {Onboarding_Org_Term_Client_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_org_term_client_label: ((inputs?: Onboarding_Org_Term_Client_LabelInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Onboarding_Org_Term_Client_LabelInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Onboarding_Org_Term_Client_LabelInputs = {};
