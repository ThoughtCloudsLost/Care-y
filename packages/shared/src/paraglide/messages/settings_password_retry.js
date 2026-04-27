/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Password_RetryInputs */

const en_settings_password_retry = /** @type {(inputs: Settings_Password_RetryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Retry key rotation`)
};

const es_settings_password_retry = /** @type {(inputs: Settings_Password_RetryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reintentar rotacion de claves`)
};

/**
* | output |
* | --- |
* | "Retry key rotation" |
*
* @param {Settings_Password_RetryInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const settings_password_retry = /** @type {((inputs?: Settings_Password_RetryInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Password_RetryInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_settings_password_retry(inputs)
	return es_settings_password_retry(inputs)
});