/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Hub_Greetings_SubtitleInputs */

const en_hub_greetings_subtitle = /** @type {(inputs: Hub_Greetings_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Recorded greetings and hold music`)
};

const es_hub_greetings_subtitle = /** @type {(inputs: Hub_Greetings_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Saludos grabados y música en espera`)
};

const en_xa2_hub_greetings_subtitle = /** @type {(inputs: Hub_Greetings_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rècòrdèd grèètìngs ànd hòld mùsìc ••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Recorded greetings and hold music" |
*
* @param {Hub_Greetings_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const hub_greetings_subtitle = /** @type {((inputs?: Hub_Greetings_SubtitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Hub_Greetings_SubtitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_hub_greetings_subtitle(inputs)
	if (locale === "en-XA") return en_xa2_hub_greetings_subtitle(inputs)
	return en_hub_greetings_subtitle(inputs)
});