/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Panel_TerminologyInputs */

const en_panel_terminology = /** @type {(inputs: Panel_TerminologyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Terminology`)
};

const es_panel_terminology = /** @type {(inputs: Panel_TerminologyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Terminología`)
};

const en_xa2_panel_terminology = /** @type {(inputs: Panel_TerminologyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tèrmìnòlògy ••••⟧`)
};

/**
* | output |
* | --- |
* | "Terminology" |
*
* @param {Panel_TerminologyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const panel_terminology = /** @type {((inputs?: Panel_TerminologyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Panel_TerminologyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_panel_terminology(inputs)
	if (locale === "en-XA") return en_xa2_panel_terminology(inputs)
	return en_panel_terminology(inputs)
});