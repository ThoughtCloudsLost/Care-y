/**
* | output |
* | --- |
* | "Sign in is username plus password. The username is a login name, not an email address, and it is chosen by the person accepting an invitation or set by an ad..." |
*
* @param {Demo_Narrative_Topic_Credentials_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_credentials_body: ((inputs?: Demo_Narrative_Topic_Credentials_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Topic_Credentials_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Topic_Credentials_BodyInputs = {};
