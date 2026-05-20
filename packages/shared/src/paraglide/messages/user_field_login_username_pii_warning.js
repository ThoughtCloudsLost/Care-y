/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} User_Field_Login_Username_Pii_WarningInputs */

const en_user_field_login_username_pii_warning = /** @type {(inputs: User_Field_Login_Username_Pii_WarningInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Login Usernames are stored with weaker encryption than display names because the server needs to be able to read them. Avoid using real names or email addresses.`)
};

const es_user_field_login_username_pii_warning = /** @type {(inputs: User_Field_Login_Username_Pii_WarningInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los nombres de usuario se almacenan con cifrado mas debil que los nombres. Evite usar nombres reales o correos electronicos.`)
};

/**
* | output |
* | --- |
* | "Login Usernames are stored with weaker encryption than display names because the server needs to be able to read them. Avoid using real names or email addres..." |
*
* @param {User_Field_Login_Username_Pii_WarningInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const user_field_login_username_pii_warning = /** @type {((inputs?: User_Field_Login_Username_Pii_WarningInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<User_Field_Login_Username_Pii_WarningInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_user_field_login_username_pii_warning(inputs)
	return es_user_field_login_username_pii_warning(inputs)
});