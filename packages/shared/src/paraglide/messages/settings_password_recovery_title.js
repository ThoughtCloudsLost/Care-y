/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Password_Recovery_TitleInputs */

const en_settings_password_recovery_title = /** @type {(inputs: Settings_Password_Recovery_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Complete key rotation`)
};

const es_settings_password_recovery_title = /** @type {(inputs: Settings_Password_Recovery_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Completar rotacion de claves`)
};

/**
* | output |
* | --- |
* | "Complete key rotation" |
*
* @param {Settings_Password_Recovery_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_password_recovery_title = /** @type {((inputs?: Settings_Password_Recovery_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Password_Recovery_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_settings_password_recovery_title(inputs)
	return es_settings_password_recovery_title(inputs)
});