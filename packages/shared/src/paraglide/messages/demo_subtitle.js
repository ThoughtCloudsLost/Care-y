/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_SubtitleInputs */

const en_demo_subtitle = /** @type {(inputs: Demo_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`See how end to end encryption protects every conversation.`)
};

const es_demo_subtitle = /** @type {(inputs: Demo_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Descubre cómo el cifrado de extremo a extremo protege cada conversación.`)
};

/**
* | output |
* | --- |
* | "See how end to end encryption protects every conversation." |
*
* @param {Demo_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_subtitle = /** @type {((inputs?: Demo_SubtitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_SubtitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_subtitle(inputs)
	return es_demo_subtitle(inputs)
});