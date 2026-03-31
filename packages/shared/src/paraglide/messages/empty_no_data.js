/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Empty_No_DataInputs */

const en_empty_no_data = /** @type {(inputs: Empty_No_DataInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nothing here yet.`)
};

const es_empty_no_data = /** @type {(inputs: Empty_No_DataInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nada aquí todavía.`)
};

/**
* | output |
* | --- |
* | "Nothing here yet." |
*
* @param {Empty_No_DataInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const empty_no_data = /** @type {((inputs?: Empty_No_DataInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Empty_No_DataInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_empty_no_data(inputs)
	return es_empty_no_data(inputs)
});