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

/**
* | output |
* | --- |
* | "Language" |
*
* @param {Demo_Topic_LanguageInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_topic_language = /** @type {((inputs?: Demo_Topic_LanguageInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Topic_LanguageInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_topic_language(inputs)
	return es_demo_topic_language(inputs)
});