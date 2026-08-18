/**
* | output |
* | --- |
* | "A volunteer will read it as soon as possible." |
*
* @param {Intake_Success_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_success_body: ((inputs?: Intake_Success_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Success_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Success_BodyInputs = {};
