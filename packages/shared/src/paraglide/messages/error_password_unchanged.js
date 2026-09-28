/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Password_UnchangedInputs */

const en_error_password_unchanged = /** @type {(inputs: Error_Password_UnchangedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The new password must be different from your current one.`)
};

const es_error_password_unchanged = /** @type {(inputs: Error_Password_UnchangedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La nueva contraseña debe ser distinta de la actual.`)
};

const en_xa2_error_password_unchanged = /** @type {(inputs: Error_Password_UnchangedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè nèw pàsswòrd mùst bè dìffèrènt fròm yòùr cùrrènt ònè. ••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The new password must be different from your current one." |
*
* @param {Error_Password_UnchangedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_password_unchanged = /** @type {((inputs?: Error_Password_UnchangedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Password_UnchangedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_password_unchanged(inputs)
	if (locale === "en-XA") return en_xa2_error_password_unchanged(inputs)
	return en_error_password_unchanged(inputs)
});