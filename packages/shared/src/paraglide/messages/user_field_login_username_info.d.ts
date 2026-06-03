/**
* | output |
* | --- |
* | "Used to sign in. Do not use your real name or email. Lowercase letters, digits, dots, hyphens, or underscores." |
*
* @param {User_Field_Login_Username_InfoInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const user_field_login_username_info: ((inputs?: User_Field_Login_Username_InfoInputs, options?: {
    locale?: "en" | "es";
}) => LocalizedString) & import("../runtime.js").MessageMetadata<User_Field_Login_Username_InfoInputs, {
    locale?: "en" | "es";
}, {}>;
export type LocalizedString = import("../runtime.js").LocalizedString;
export type User_Field_Login_Username_InfoInputs = {};
