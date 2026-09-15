/**
* | output |
* | --- |
* | "Signing out deletes the session on the server, expires the browser's cookie, zeros all key material from memory, and returns the page to the sign in form. Un..." |
*
* @param {Demo_Narrative_Client_Account_Sign_Out_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_account_sign_out_body: ((inputs?: Demo_Narrative_Client_Account_Sign_Out_BodyInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Client_Account_Sign_Out_BodyInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Client_Account_Sign_Out_BodyInputs = {};
