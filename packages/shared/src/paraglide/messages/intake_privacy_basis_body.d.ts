/**
* | output |
* | --- |
* | "We process your information to provide support you requested. Your organization should confirm the specific legal basis with legal counsel." |
*
* @param {Intake_Privacy_Basis_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_basis_body: ((inputs?: Intake_Privacy_Basis_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Privacy_Basis_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Privacy_Basis_BodyInputs = {};
