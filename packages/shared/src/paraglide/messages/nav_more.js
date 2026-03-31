/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Nav_MoreInputs */

const en_nav_more = /** @type {(inputs: Nav_MoreInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`More`)
};

const es_nav_more = /** @type {(inputs: Nav_MoreInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Más`)
};

/**
* | output |
* | --- |
* | "More" |
*
* @param {Nav_MoreInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const nav_more = /** @type {((inputs?: Nav_MoreInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Nav_MoreInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_nav_more(inputs)
	return es_nav_more(inputs)
});