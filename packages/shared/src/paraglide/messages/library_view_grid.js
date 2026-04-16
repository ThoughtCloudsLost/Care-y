/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_View_GridInputs */

const en_library_view_grid = /** @type {(inputs: Library_View_GridInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Grid view`)
};

const es_library_view_grid = /** @type {(inputs: Library_View_GridInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vista de cuadrícula`)
};

/**
* | output |
* | --- |
* | "Grid view" |
*
* @param {Library_View_GridInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_view_grid = /** @type {((inputs?: Library_View_GridInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_View_GridInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_view_grid(inputs)
	return es_library_view_grid(inputs)
});