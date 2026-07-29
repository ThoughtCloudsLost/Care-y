/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Coming_Soon_DescInputs */

const en_demo_coming_soon_desc = /** @type {(inputs: Demo_Coming_Soon_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This screen is part of the real product build, but its guided story has not been written yet.`)
};

const es_demo_coming_soon_desc = /** @type {(inputs: Demo_Coming_Soon_DescInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Esta pantalla forma parte del producto real, pero su recorrido guiado aun no se ha escrito.`)
};

/**
* | output |
* | --- |
* | "This screen is part of the real product build, but its guided story has not been written yet." |
*
* @param {Demo_Coming_Soon_DescInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_coming_soon_desc = /** @type {((inputs?: Demo_Coming_Soon_DescInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Coming_Soon_DescInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_coming_soon_desc(inputs)
	return es_demo_coming_soon_desc(inputs)
});