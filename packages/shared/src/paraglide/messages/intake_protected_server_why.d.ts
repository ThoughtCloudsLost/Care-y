/**
* | output |
* | --- |
* | "If someone gains access to this server, they see only encrypted text. Decrypting it requires a volunteer's password plus verification from two separate serve..." |
*
* @param {Intake_Protected_Server_WhyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_protected_server_why: ((inputs?: Intake_Protected_Server_WhyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Protected_Server_WhyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Protected_Server_WhyInputs = {};
