/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Mgr_Section_ProtectedInputs */

const en_mgr_section_protected = /** @type {(inputs: Mgr_Section_ProtectedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Protection`)
};

const es_mgr_section_protected = /** @type {(inputs: Mgr_Section_ProtectedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Protección`)
};

const en_xa2_mgr_section_protected = /** @type {(inputs: Mgr_Section_ProtectedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Pròtèctìòn •••⟧`)
};

/**
* | output |
* | --- |
* | "Protection" |
*
* @param {Mgr_Section_ProtectedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const mgr_section_protected = /** @type {((inputs?: Mgr_Section_ProtectedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Mgr_Section_ProtectedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_mgr_section_protected(inputs)
	if (locale === "en-XA") return en_xa2_mgr_section_protected(inputs)
	return en_mgr_section_protected(inputs)
});