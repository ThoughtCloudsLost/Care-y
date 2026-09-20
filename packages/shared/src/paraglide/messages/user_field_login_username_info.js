/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} User_Field_Login_Username_InfoInputs */

const en_user_field_login_username_info = /** @type {(inputs: User_Field_Login_Username_InfoInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Used to sign in. Do not use your real name or email. Lowercase letters, digits, dots, hyphens, or underscores.`)
};

const es_user_field_login_username_info = /** @type {(inputs: User_Field_Login_Username_InfoInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Se usa para iniciar sesión. No uses tu nombre real ni correo electrónico. Letras minúsculas, dígitos, puntos, guiones o guiones bajos.`)
};

const en_xa2_user_field_login_username_info = /** @type {(inputs: User_Field_Login_Username_InfoInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùsèd tò sìgn ìn. Dò nòt ùsè yòùr rèàl nàmè òr èmàìl. Lòwèrcàsè lèttèrs, dìgìts, dòts, hyphèns, òr ùndèrscòrès. •••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Used to sign in. Do not use your real name or email. Lowercase letters, digits, dots, hyphens, or underscores." |
*
* @param {User_Field_Login_Username_InfoInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const user_field_login_username_info = /** @type {((inputs?: User_Field_Login_Username_InfoInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<User_Field_Login_Username_InfoInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_user_field_login_username_info(inputs)
	if (locale === "en-XA") return en_xa2_user_field_login_username_info(inputs)
	return en_user_field_login_username_info(inputs)
});