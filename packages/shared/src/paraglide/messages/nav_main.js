/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Nav_MainInputs */

const en_nav_main = /** @type {(inputs: Nav_MainInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Main navigation`)
};

const es_nav_main = /** @type {(inputs: Nav_MainInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Navegación principal`)
};

/**
* | output |
* | --- |
* | "Main navigation" |
*
* @param {Nav_MainInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const nav_main = /** @type {((inputs?: Nav_MainInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Nav_MainInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_nav_main(inputs)
	return es_nav_main(inputs)
});