/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Vol_Section_ProtectedInputs */

const en_vol_section_protected = /** @type {(inputs: Vol_Section_ProtectedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`How You're Protected`)
};

const es_vol_section_protected = /** @type {(inputs: Vol_Section_ProtectedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Como Estas Protegido`)
};

/**
* | output |
* | --- |
* | "How You're Protected" |
*
* @param {Vol_Section_ProtectedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const vol_section_protected = /** @type {((inputs?: Vol_Section_ProtectedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Vol_Section_ProtectedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_vol_section_protected(inputs)
	return es_vol_section_protected(inputs)
});