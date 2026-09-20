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

const en_xa2_demo_coming_soon_heading = /** @type {(inputs: Demo_Coming_Soon_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èxplòrè frèèly •••••⟧`)
};

/**
* | output |
* | --- |
* | "Explore freely" |
*
* @param {Demo_Coming_Soon_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_coming_soon_heading = /** @type {((inputs?: Demo_Coming_Soon_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Coming_Soon_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_coming_soon_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_coming_soon_heading(inputs)
	return en_demo_coming_soon_heading(inputs)
});