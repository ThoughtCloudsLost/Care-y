/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Hub_Note_Types_SubtitleInputs */

const en_hub_note_types_subtitle = /** @type {(inputs: Hub_Note_Types_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Note categories, escalation routing, and system event types`)
};

const es_hub_note_types_subtitle = /** @type {(inputs: Hub_Note_Types_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Categorías de notas, enrutamiento de escalamiento y tipos de eventos del sistema`)
};

const en_xa2_hub_note_types_subtitle = /** @type {(inputs: Hub_Note_Types_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nòtè càtègòrìès, èscàlàtìòn ròùtìng, ànd systèm èvènt typès ••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Note categories, escalation routing, and system event types" |
*
* @param {Hub_Note_Types_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const hub_note_types_subtitle = /** @type {((inputs?: Hub_Note_Types_SubtitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Hub_Note_Types_SubtitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_hub_note_types_subtitle(inputs)
	if (locale === "en-XA") return en_xa2_hub_note_types_subtitle(inputs)
	return en_hub_note_types_subtitle(inputs)
});