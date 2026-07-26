/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Hub_Quarantine_SubtitleInputs */

const en_hub_quarantine_subtitle = /** @type {(inputs: Hub_Quarantine_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Voicemails that could not be routed automatically`)
};

const es_hub_quarantine_subtitle = /** @type {(inputs: Hub_Quarantine_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mensajes de voz que no se pudieron enrutar automaticamente`)
};

/**
* | output |
* | --- |
* | "Voicemails that could not be routed automatically" |
*
* @param {Hub_Quarantine_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const hub_quarantine_subtitle = /** @type {((inputs?: Hub_Quarantine_SubtitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Hub_Quarantine_SubtitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_hub_quarantine_subtitle(inputs)
	return es_hub_quarantine_subtitle(inputs)
});