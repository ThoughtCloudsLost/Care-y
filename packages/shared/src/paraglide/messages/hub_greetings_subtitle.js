/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Hub_Greetings_SubtitleInputs */

const en_hub_greetings_subtitle = /** @type {(inputs: Hub_Greetings_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Recorded greetings and hold music`)
};

const es_hub_greetings_subtitle = /** @type {(inputs: Hub_Greetings_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Saludos grabados y musica en espera`)
};

/**
* | output |
* | --- |
* | "Recorded greetings and hold music" |
*
* @param {Hub_Greetings_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const hub_greetings_subtitle = /** @type {((inputs?: Hub_Greetings_SubtitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Hub_Greetings_SubtitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_hub_greetings_subtitle(inputs)
	return es_hub_greetings_subtitle(inputs)
});