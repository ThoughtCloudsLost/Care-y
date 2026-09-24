/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_HomeInputs */

const en_demo_home = /** @type {(inputs: Demo_HomeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Handbook introduction`)
};

const es_demo_home = /** @type {(inputs: Demo_HomeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Introducción del manual`)
};

const en_xa2_demo_home = /** @type {(inputs: Demo_HomeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Hàndbòòk ìntròdùctìòn •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Handbook introduction" |
*
* @param {Demo_HomeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_home = /** @type {((inputs?: Demo_HomeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_HomeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_home(inputs)
	if (locale === "en-XA") return en_xa2_demo_home(inputs)
	return en_demo_home(inputs)
});