/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Library_SelectedInputs */

const en_library_selected = /** @type {(inputs: Library_SelectedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} selected`)
};

const es_library_selected = /** @type {(inputs: Library_SelectedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} seleccionados`)
};

const en_xa2_library_selected = /** @type {(inputs: Library_SelectedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} sèlèctèd •••⟧`)
};

/**
* | output |
* | --- |
* | "{count} selected" |
*
* @param {Library_SelectedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_selected = /** @type {((inputs: Library_SelectedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_SelectedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_selected(inputs)
	if (locale === "en-XA") return en_xa2_library_selected(inputs)
	return en_library_selected(inputs)
});