/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Password_WrongInputs */

const en_settings_password_wrong = /** @type {(inputs: Settings_Password_WrongInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Current password is incorrect`)
};

const es_settings_password_wrong = /** @type {(inputs: Settings_Password_WrongInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La contrasena actual es incorrecta`)
};

/**
* | output |
* | --- |
* | "Current password is incorrect" |
*
* @param {Settings_Password_WrongInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_password_wrong = /** @type {((inputs?: Settings_Password_WrongInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Password_WrongInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_settings_password_wrong(inputs)
	return es_settings_password_wrong(inputs)
});