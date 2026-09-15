/**
* | output |
* | --- |
* | "Changing the password ends every other active session and keeps the client's message history, and the new password must be at least 8 characters. **How it wo..." |
*
* @param {Demo_Narrative_Client_Account_Password_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_account_password_body: ((inputs?: Demo_Narrative_Client_Account_Password_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Client_Account_Password_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Client_Account_Password_BodyInputs = {};
