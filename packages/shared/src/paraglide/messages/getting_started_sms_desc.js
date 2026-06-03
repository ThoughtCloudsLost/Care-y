/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Getting_Started_Sms_DescInputs */

const en_getting_started_sms_desc = /** @type {(inputs: Getting_Started_Sms_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Set up automated text message responses for incoming messages.`)
};

const es_getting_started_sms_desc = /** @type {(inputs: Getting_Started_Sms_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configura respuestas automaticas para mensajes de texto entrantes.`)
};

/**
* | output |
* | --- |
* | "Set up automated text message responses for incoming messages." |
*
* @param {Getting_Started_Sms_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const getting_started_sms_desc = /** @type {((inputs?: Getting_Started_Sms_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Getting_Started_Sms_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_getting_started_sms_desc(inputs)
	return es_getting_started_sms_desc(inputs)
});