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

const en_xa2_vol_section_access = /** @type {(inputs: Vol_Section_AccessInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòùr Àccèss ••••⟧`)
};

/**
* | output |
* | --- |
* | "Your Access" |
*
* @param {Vol_Section_AccessInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const vol_section_access = /** @type {((inputs?: Vol_Section_AccessInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Vol_Section_AccessInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_vol_section_access(inputs)
	if (locale === "en-XA") return en_xa2_vol_section_access(inputs)
	return en_vol_section_access(inputs)
});