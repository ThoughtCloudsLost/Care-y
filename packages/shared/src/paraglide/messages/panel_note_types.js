/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Panel_Note_TypesInputs */

const en_panel_note_types = /** @type {(inputs: Panel_Note_TypesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Follow-Up Types`)
};

const es_panel_note_types = /** @type {(inputs: Panel_Note_TypesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tipos de seguimiento`)
};

/**
* | output |
* | --- |
* | "Follow-Up Types" |
*
* @param {Panel_Note_TypesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const panel_note_types = /** @type {((inputs?: Panel_Note_TypesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Panel_Note_TypesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_panel_note_types(inputs)
	return es_panel_note_types(inputs)
});