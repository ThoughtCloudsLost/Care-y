/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Coming_Soon_TitleInputs */

const en_demo_coming_soon_title = /** @type {(inputs: Demo_Coming_Soon_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Coming soon`)
};

const es_demo_coming_soon_title = /** @type {(inputs: Demo_Coming_Soon_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Proximamente`)
};

/**
* | output |
* | --- |
* | "Coming soon" |
*
* @param {Demo_Coming_Soon_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_coming_soon_title = /** @type {((inputs?: Demo_Coming_Soon_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Coming_Soon_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_coming_soon_title(inputs)
	return es_demo_coming_soon_title(inputs)
});