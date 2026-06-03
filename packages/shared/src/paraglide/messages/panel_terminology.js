/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Panel_TerminologyInputs */

const en_panel_terminology = /** @type {(inputs: Panel_TerminologyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Terminology`)
};

const es_panel_terminology = /** @type {(inputs: Panel_TerminologyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Terminologia`)
};

/**
* | output |
* | --- |
* | "Terminology" |
*
* @param {Panel_TerminologyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const panel_terminology = /** @type {((inputs?: Panel_TerminologyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Panel_TerminologyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_panel_terminology(inputs)
	return es_panel_terminology(inputs)
});