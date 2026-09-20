/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Saved_Filter_DeleteInputs */

const en_saved_filter_delete = /** @type {(inputs: Saved_Filter_DeleteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Delete`)
};

const es_saved_filter_delete = /** @type {(inputs: Saved_Filter_DeleteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Eliminar`)
};

const en_xa2_saved_filter_delete = /** @type {(inputs: Saved_Filter_DeleteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dèlètè ••⟧`)
};

/**
* | output |
* | --- |
* | "Delete" |
*
* @param {Saved_Filter_DeleteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const saved_filter_delete = /** @type {((inputs?: Saved_Filter_DeleteInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Saved_Filter_DeleteInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_saved_filter_delete(inputs)
	if (locale === "en-XA") return en_xa2_saved_filter_delete(inputs)
	return en_saved_filter_delete(inputs)
});