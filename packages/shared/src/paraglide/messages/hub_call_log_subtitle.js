/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ tickets: NonNullable<unknown> }} Hub_Call_Log_SubtitleInputs */

const en_hub_call_log_subtitle = /** @type {(inputs: Hub_Call_Log_SubtitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Browse call and voicemail history across all ${i?.tickets}`)
};

const es_hub_call_log_subtitle = /** @type {(inputs: Hub_Call_Log_SubtitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Historial de llamadas y mensajes de voz de todos los ${i?.tickets}`)
};

/**
* | output |
* | --- |
* | "Browse call and voicemail history across all {tickets}" |
*
* @param {Hub_Call_Log_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const hub_call_log_subtitle = /** @type {((inputs: Hub_Call_Log_SubtitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Hub_Call_Log_SubtitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_hub_call_log_subtitle(inputs)
	return es_hub_call_log_subtitle(inputs)
});