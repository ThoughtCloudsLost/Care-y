/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_ContentsInputs */

const en_demo_contents = /** @type {(inputs: Demo_ContentsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Contents`)
};

const es_demo_contents = /** @type {(inputs: Demo_ContentsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Contenido`)
};

/**
* | output |
* | --- |
* | "Contents" |
*
* @param {Demo_ContentsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_contents = /** @type {((inputs?: Demo_ContentsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_ContentsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_contents(inputs)
	return es_demo_contents(inputs)
});