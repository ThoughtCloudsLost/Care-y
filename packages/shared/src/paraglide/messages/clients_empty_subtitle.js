/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Clients: NonNullable<unknown>, tickets: NonNullable<unknown>, clients: NonNullable<unknown> }} Clients_Empty_SubtitleInputs */

const en_clients_empty_subtitle = /** @type {(inputs: Clients_Empty_SubtitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Clients} are created when ${i?.tickets} are opened.`)
};

const es_clients_empty_subtitle = /** @type {(inputs: Clients_Empty_SubtitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Los ${i?.clients} se crean cuando se abren ${i?.tickets}.`)
};

/**
* | output |
* | --- |
* | "{Clients} are created when {tickets} are opened." |
*
* @param {Clients_Empty_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const clients_empty_subtitle = /** @type {((inputs: Clients_Empty_SubtitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Clients_Empty_SubtitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_clients_empty_subtitle(inputs)
	return es_clients_empty_subtitle(inputs)
});