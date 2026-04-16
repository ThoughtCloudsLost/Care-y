/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Create_Coming_SoonInputs */

const en_create_coming_soon = /** @type {(inputs: Create_Coming_SoonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Coming soon`)
};

const es_create_coming_soon = /** @type {(inputs: Create_Coming_SoonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Próximamente`)
};

/**
* | output |
* | --- |
* | "Coming soon" |
*
* @param {Create_Coming_SoonInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const create_coming_soon = /** @type {((inputs?: Create_Coming_SoonInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Create_Coming_SoonInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_create_coming_soon(inputs)
	return es_create_coming_soon(inputs)
});