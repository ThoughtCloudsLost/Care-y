/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Logs_Calls_Empty_SubtitleInputs */

const en_logs_calls_empty_subtitle = /** @type {(inputs: Logs_Calls_Empty_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Call and voicemail records will appear here as they are logged.`)
};

const es_logs_calls_empty_subtitle = /** @type {(inputs: Logs_Calls_Empty_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los registros de llamadas y mensajes de voz apareceran aqui a medida que se registren.`)
};

/**
* | output |
* | --- |
* | "Call and voicemail records will appear here as they are logged." |
*
* @param {Logs_Calls_Empty_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const logs_calls_empty_subtitle = /** @type {((inputs?: Logs_Calls_Empty_SubtitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Logs_Calls_Empty_SubtitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_logs_calls_empty_subtitle(inputs)
	return es_logs_calls_empty_subtitle(inputs)
});