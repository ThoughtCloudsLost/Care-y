/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Exit_MultiselectInputs */

const en_library_exit_multiselect = /** @type {(inputs: Library_Exit_MultiselectInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Exit selection mode`)
};

const es_library_exit_multiselect = /** @type {(inputs: Library_Exit_MultiselectInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Salir del modo de selección`)
};

/**
* | output |
* | --- |
* | "Exit selection mode" |
*
* @param {Library_Exit_MultiselectInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_exit_multiselect = /** @type {((inputs?: Library_Exit_MultiselectInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Exit_MultiselectInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_exit_multiselect(inputs)
	return es_library_exit_multiselect(inputs)
});