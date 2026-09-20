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

const en_xa2_nav_main = /** @type {(inputs: Nav_MainInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Màìn nàvìgàtìòn •••••⟧`)
};

/**
* | output |
* | --- |
* | "Main navigation" |
*
* @param {Nav_MainInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const nav_main = /** @type {((inputs?: Nav_MainInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Nav_MainInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_nav_main(inputs)
	if (locale === "en-XA") return en_xa2_nav_main(inputs)
	return en_nav_main(inputs)
});