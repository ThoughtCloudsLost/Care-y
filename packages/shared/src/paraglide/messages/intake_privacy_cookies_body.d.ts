/**
* | output |
* | --- |
* | "This site uses only session and security cookies that are needed for the form to work. These cookies do not track you and do not require your consent." |
*
* @param {Intake_Privacy_Cookies_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_cookies_body: ((inputs?: Intake_Privacy_Cookies_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Intake_Privacy_Cookies_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Intake_Privacy_Cookies_BodyInputs = {};
