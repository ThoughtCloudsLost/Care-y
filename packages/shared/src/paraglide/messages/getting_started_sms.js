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

const en_xa2_getting_started_sms = /** @type {(inputs: Getting_Started_SmsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Cònfìgùrè SMS tèmplàtès •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Configure SMS templates" |
*
* @param {Getting_Started_SmsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const getting_started_sms = /** @type {((inputs?: Getting_Started_SmsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Getting_Started_SmsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_getting_started_sms(inputs)
	if (locale === "en-XA") return en_xa2_getting_started_sms(inputs)
	return en_getting_started_sms(inputs)
});