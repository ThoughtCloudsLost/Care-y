/**
* | output |
* | --- |
* | "Signing out wipes the keys in the browser first, then ends the server-side session and expires the cookie. The page shows a voluntary sign-out confirmation a..." |
*
* @param {Demo_Narrative_Client_Account_Sign_Out_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_account_sign_out_body: ((inputs?: Demo_Narrative_Client_Account_Sign_Out_BodyInputs, options?: {
    locale?: "en" | "es" | "en-XA";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<Demo_Narrative_Client_Account_Sign_Out_BodyInputs, {
    locale?: "en" | "es" | "en-XA";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type Demo_Narrative_Client_Account_Sign_Out_BodyInputs = {};
