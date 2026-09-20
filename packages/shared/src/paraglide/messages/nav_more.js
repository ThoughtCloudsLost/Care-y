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

const en_xa2_nav_more = /** @type {(inputs: Nav_MoreInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mòrè ••⟧`)
};

/**
* | output |
* | --- |
* | "More" |
*
* @param {Nav_MoreInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const nav_more = /** @type {((inputs?: Nav_MoreInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Nav_MoreInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_nav_more(inputs)
	if (locale === "en-XA") return en_xa2_nav_more(inputs)
	return en_nav_more(inputs)
});