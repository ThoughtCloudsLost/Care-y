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

/**
* | output |
* | --- |
* | "Handbook introduction" |
*
* @param {Demo_HomeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_home = /** @type {((inputs?: Demo_HomeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_HomeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_home(inputs)
	return es_demo_home(inputs)
});