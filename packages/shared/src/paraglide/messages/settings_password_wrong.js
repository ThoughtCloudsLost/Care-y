/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Password_WrongInputs */

const en_settings_password_wrong = /** @type {(inputs: Settings_Password_WrongInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Current password is incorrect`)
};

const es_settings_password_wrong = /** @type {(inputs: Settings_Password_WrongInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La contraseña actual es incorrecta`)
};

const en_xa2_settings_password_wrong = /** @type {(inputs: Settings_Password_WrongInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Cùrrènt pàsswòrd ìs ìncòrrèct •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Current password is incorrect" |
*
* @param {Settings_Password_WrongInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_password_wrong = /** @type {((inputs?: Settings_Password_WrongInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Password_WrongInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_settings_password_wrong(inputs)
	if (locale === "en-XA") return en_xa2_settings_password_wrong(inputs)
	return en_settings_password_wrong(inputs)
});