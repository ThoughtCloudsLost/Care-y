/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} User_Field_Login_Username_InfoInputs */

const en_user_field_login_username_info = /** @type {(inputs: User_Field_Login_Username_InfoInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Used to sign in. Do not use your real name or email. Lowercase letters, digits, dots, hyphens, or underscores.`)
};

const es_user_field_login_username_info = /** @type {(inputs: User_Field_Login_Username_InfoInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Se usa para iniciar sesion. No uses tu nombre real ni correo electronico. Letras minusculas, digitos, puntos, guiones o guiones bajos.`)
};

/**
* | output |
* | --- |
* | "Used to sign in. Do not use your real name or email. Lowercase letters, digits, dots, hyphens, or underscores." |
*
* @param {User_Field_Login_Username_InfoInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const user_field_login_username_info = /** @type {((inputs?: User_Field_Login_Username_InfoInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<User_Field_Login_Username_InfoInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_user_field_login_username_info(inputs)
	return es_user_field_login_username_info(inputs)
});