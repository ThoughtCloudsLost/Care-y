/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Getting_Started_Sms_DescInputs */

const en_getting_started_sms_desc = /** @type {(inputs: Getting_Started_Sms_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Set up automated text message responses for incoming messages.`)
};

const es_getting_started_sms_desc = /** @type {(inputs: Getting_Started_Sms_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configura respuestas automáticas para mensajes de texto entrantes.`)
};

const en_xa2_getting_started_sms_desc = /** @type {(inputs: Getting_Started_Sms_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèt ùp àùtòmàtèd tèxt mèssàgè rèspònsès fòr ìncòmìng mèssàgès. •••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Set up automated text message responses for incoming messages." |
*
* @param {Getting_Started_Sms_DescInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const getting_started_sms_desc = /** @type {((inputs?: Getting_Started_Sms_DescInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Getting_Started_Sms_DescInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_getting_started_sms_desc(inputs)
	if (locale === "en-XA") return en_xa2_getting_started_sms_desc(inputs)
	return en_getting_started_sms_desc(inputs)
});