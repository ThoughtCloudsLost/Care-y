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

const en_xa2_panel_note_types = /** @type {(inputs: Panel_Note_TypesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fòllòw-Ùp Typès •••••⟧`)
};

/**
* | output |
* | --- |
* | "Follow-Up Types" |
*
* @param {Panel_Note_TypesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const panel_note_types = /** @type {((inputs?: Panel_Note_TypesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Panel_Note_TypesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_panel_note_types(inputs)
	if (locale === "en-XA") return en_xa2_panel_note_types(inputs)
	return en_panel_note_types(inputs)
});