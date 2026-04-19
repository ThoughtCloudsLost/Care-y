/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Mgr_Section_ProtectedInputs */

const en_mgr_section_protected = /** @type {(inputs: Mgr_Section_ProtectedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Protection`)
};

const es_mgr_section_protected = /** @type {(inputs: Mgr_Section_ProtectedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Proteccion`)
};

/**
* | output |
* | --- |
* | "Protection" |
*
* @param {Mgr_Section_ProtectedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const mgr_section_protected = /** @type {((inputs?: Mgr_Section_ProtectedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Mgr_Section_ProtectedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_mgr_section_protected(inputs)
	return es_mgr_section_protected(inputs)
});