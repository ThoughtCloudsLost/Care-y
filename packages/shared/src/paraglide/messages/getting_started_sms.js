/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Getting_Started_SmsInputs */

const en_getting_started_sms = /** @type {(inputs: Getting_Started_SmsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configure SMS templates`)
};

const es_getting_started_sms = /** @type {(inputs: Getting_Started_SmsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configurar plantillas SMS`)
};

/**
* | output |
* | --- |
* | "Configure SMS templates" |
*
* @param {Getting_Started_SmsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const getting_started_sms = /** @type {((inputs?: Getting_Started_SmsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Getting_Started_SmsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_getting_started_sms(inputs)
	return es_getting_started_sms(inputs)
});