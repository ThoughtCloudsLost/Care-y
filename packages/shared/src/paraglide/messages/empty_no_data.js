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

const en_xa2_empty_no_data = /** @type {(inputs: Empty_No_DataInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nòthìng hèrè yèt. ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Nothing here yet." |
*
* @param {Empty_No_DataInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const empty_no_data = /** @type {((inputs?: Empty_No_DataInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Empty_No_DataInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_empty_no_data(inputs)
	if (locale === "en-XA") return en_xa2_empty_no_data(inputs)
	return en_empty_no_data(inputs)
});