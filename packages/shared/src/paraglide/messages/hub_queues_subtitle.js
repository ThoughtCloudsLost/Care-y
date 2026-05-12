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

/**
* | output |
* | --- |
* | "Create and assign {ticket} {queues}" |
*
* @param {Hub_Queues_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const hub_queues_subtitle = /** @type {((inputs: Hub_Queues_SubtitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Hub_Queues_SubtitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_hub_queues_subtitle(inputs)
	return es_hub_queues_subtitle(inputs)
});