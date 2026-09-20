/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ ticket: NonNullable<unknown>, queues: NonNullable<unknown>, tickets: NonNullable<unknown> }} Hub_Queues_SubtitleInputs */

const en_hub_queues_subtitle = /** @type {(inputs: Hub_Queues_SubtitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Create and assign ${i?.ticket} ${i?.queues}`)
};

const es_hub_queues_subtitle = /** @type {(inputs: Hub_Queues_SubtitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Crear y asignar ${i?.queues} de ${i?.tickets}`)
};

const en_xa2_hub_queues_subtitle = /** @type {(inputs: Hub_Queues_SubtitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Crèàtè ànd àssìgn  ••••••${i?.ticket}  •${i?.queues}⟧`)
};

/**
* | output |
* | --- |
* | "Create and assign {ticket} {queues}" |
*
* @param {Hub_Queues_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const hub_queues_subtitle = /** @type {((inputs: Hub_Queues_SubtitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Hub_Queues_SubtitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_hub_queues_subtitle(inputs)
	if (locale === "en-XA") return en_xa2_hub_queues_subtitle(inputs)
	return en_hub_queues_subtitle(inputs)
});