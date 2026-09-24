/**
* | output |
* | --- |
* | "Providing your information is voluntary. If you choose not to share contact details, the organization will not be able to reach out to you, but you can check..." |
*
* @param {Intake_Privacy_Voluntary_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_voluntary_body: ((inputs?: Intake_Privacy_Voluntary_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Privacy_Voluntary_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Privacy_Voluntary_BodyInputs = {};
