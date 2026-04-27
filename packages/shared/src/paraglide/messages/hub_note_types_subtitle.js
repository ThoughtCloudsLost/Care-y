/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Hub_Note_Types_SubtitleInputs */

const en_hub_note_types_subtitle = /** @type {(inputs: Hub_Note_Types_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Note categories, escalation routing, and system event types`)
};

const es_hub_note_types_subtitle = /** @type {(inputs: Hub_Note_Types_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Categorias de notas, enrutamiento de escalamiento y tipos de eventos del sistema`)
};

/**
* | output |
* | --- |
* | "Note categories, escalation routing, and system event types" |
*
* @param {Hub_Note_Types_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const hub_note_types_subtitle = /** @type {((inputs?: Hub_Note_Types_SubtitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Hub_Note_Types_SubtitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_hub_note_types_subtitle(inputs)
	return es_hub_note_types_subtitle(inputs)
});