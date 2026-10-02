/**
* | output |
* | --- |
* | "CARE-Y ships as one codebase and four container images (API, web, reverse proxy, and OPRF evaluator) that run in two deployment types. A hosted multi-tenant ..." |
*
* @param {Demo_Narrative_Deepdive_Deployment_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_deepdive_deployment_body: ((inputs?: Demo_Narrative_Deepdive_Deployment_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Deepdive_Deployment_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Deepdive_Deployment_BodyInputs = {};
