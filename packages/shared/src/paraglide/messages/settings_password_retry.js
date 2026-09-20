/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Settings_Password_RetryInputs */

const en_settings_password_retry = /** @type {(inputs: Settings_Password_RetryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Retry key rotation`)
};

const es_settings_password_retry = /** @type {(inputs: Settings_Password_RetryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reintentar rotación de claves`)
};

const en_xa2_settings_password_retry = /** @type {(inputs: Settings_Password_RetryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rètry kèy ròtàtìòn ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Retry key rotation" |
*
* @param {Settings_Password_RetryInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const settings_password_retry = /** @type {((inputs?: Settings_Password_RetryInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Settings_Password_RetryInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_settings_password_retry(inputs)
	if (locale === "en-XA") return en_xa2_settings_password_retry(inputs)
	return en_settings_password_retry(inputs)
});