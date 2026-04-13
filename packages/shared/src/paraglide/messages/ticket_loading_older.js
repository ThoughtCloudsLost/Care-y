/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Loading_OlderInputs */

const en_ticket_loading_older = /** @type {(inputs: Ticket_Loading_OlderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Loading older messages...`)
};

const es_ticket_loading_older = /** @type {(inputs: Ticket_Loading_OlderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cargando mensajes anteriores...`)
};

/**
* | output |
* | --- |
* | "Loading older messages..." |
*
* @param {Ticket_Loading_OlderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_loading_older = /** @type {((inputs?: Ticket_Loading_OlderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Loading_OlderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_loading_older(inputs)
	return es_ticket_loading_older(inputs)
});