/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Vol_Section_AccessInputs */

const en_vol_section_access = /** @type {(inputs: Vol_Section_AccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your Access`)
};

const es_vol_section_access = /** @type {(inputs: Vol_Section_AccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tu Acceso`)
};

/**
* | output |
* | --- |
* | "Your Access" |
*
* @param {Vol_Section_AccessInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const vol_section_access = /** @type {((inputs?: Vol_Section_AccessInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Vol_Section_AccessInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_vol_section_access(inputs)
	return es_vol_section_access(inputs)
});