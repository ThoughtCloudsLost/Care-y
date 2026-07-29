/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Coming_Soon_HeadingInputs */

const en_demo_coming_soon_heading = /** @type {(inputs: Demo_Coming_Soon_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Explore freely`)
};

const es_demo_coming_soon_heading = /** @type {(inputs: Demo_Coming_Soon_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Explore libremente`)
};

/**
* | output |
* | --- |
* | "Explore freely" |
*
* @param {Demo_Coming_Soon_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_coming_soon_heading = /** @type {((inputs?: Demo_Coming_Soon_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Coming_Soon_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_coming_soon_heading(inputs)
	return es_demo_coming_soon_heading(inputs)
});