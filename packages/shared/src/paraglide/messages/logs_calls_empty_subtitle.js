/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Logs_Calls_Empty_SubtitleInputs */

const en_logs_calls_empty_subtitle = /** @type {(inputs: Logs_Calls_Empty_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Call and voicemail records will appear here as they are logged.`)
};

const es_logs_calls_empty_subtitle = /** @type {(inputs: Logs_Calls_Empty_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los registros de llamadas y mensajes de voz apareceran aquí a medida que se registren.`)
};

const en_xa2_logs_calls_empty_subtitle = /** @type {(inputs: Logs_Calls_Empty_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Càll ànd vòìcèmàìl rècòrds wìll àppèàr hèrè às thèy àrè lòggèd. •••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Call and voicemail records will appear here as they are logged." |
*
* @param {Logs_Calls_Empty_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const logs_calls_empty_subtitle = /** @type {((inputs?: Logs_Calls_Empty_SubtitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Logs_Calls_Empty_SubtitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_logs_calls_empty_subtitle(inputs)
	if (locale === "en-XA") return en_xa2_logs_calls_empty_subtitle(inputs)
	return en_logs_calls_empty_subtitle(inputs)
});