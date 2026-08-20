/**
* | output |
* | --- |
* | "Credentials" |
*
* @param {Demo_Topic_CredentialsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_topic_credentials: ((inputs?: Demo_Topic_CredentialsInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Topic_CredentialsInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Topic_CredentialsInputs = {};
