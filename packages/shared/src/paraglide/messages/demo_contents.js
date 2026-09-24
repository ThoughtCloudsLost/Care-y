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

const en_xa2_demo_contents = /** @type {(inputs: Demo_ContentsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còntènts •••⟧`)
};

/**
* | output |
* | --- |
* | "Contents" |
*
* @param {Demo_ContentsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_contents = /** @type {((inputs?: Demo_ContentsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_ContentsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_contents(inputs)
	if (locale === "en-XA") return en_xa2_demo_contents(inputs)
	return en_demo_contents(inputs)
});