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

const en_xa2_hub_call_log_subtitle = /** @type {(inputs: Hub_Call_Log_SubtitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Bròwsè càll ànd vòìcèmàìl hìstòry àcròss àll  ••••••••••••••${i?.tickets}⟧`)
};

/**
* | output |
* | --- |
* | "Browse call and voicemail history across all {tickets}" |
*
* @param {Hub_Call_Log_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const hub_call_log_subtitle = /** @type {((inputs: Hub_Call_Log_SubtitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Hub_Call_Log_SubtitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_hub_call_log_subtitle(inputs)
	if (locale === "en-XA") return en_xa2_hub_call_log_subtitle(inputs)
	return en_hub_call_log_subtitle(inputs)
});