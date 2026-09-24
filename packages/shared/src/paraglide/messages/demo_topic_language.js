/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Topic_LanguageInputs */

const en_demo_topic_language = /** @type {(inputs: Demo_Topic_LanguageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Language`)
};

const es_demo_topic_language = /** @type {(inputs: Demo_Topic_LanguageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Idioma`)
};

const en_xa2_demo_topic_language = /** @type {(inputs: Demo_Topic_LanguageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Làngùàgè •••⟧`)
};

/**
* | output |
* | --- |
* | "Language" |
*
* @param {Demo_Topic_LanguageInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_topic_language = /** @type {((inputs?: Demo_Topic_LanguageInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Topic_LanguageInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_topic_language(inputs)
	if (locale === "en-XA") return en_xa2_demo_topic_language(inputs)
	return en_demo_topic_language(inputs)
});