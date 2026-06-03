/**
* | output |
* | --- |
* | "Login Usernames are stored with weaker encryption than display names because the server needs to be able to read them. Avoid using real names or email addres..." |
*
* @param {User_Field_Login_Username_Pii_WarningInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const user_field_login_username_pii_warning: ((inputs?: User_Field_Login_Username_Pii_WarningInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<User_Field_Login_Username_Pii_WarningInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type User_Field_Login_Username_Pii_WarningInputs = {};
