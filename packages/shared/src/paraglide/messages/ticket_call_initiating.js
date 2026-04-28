/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Call_InitiatingInputs */

const en_ticket_call_initiating = /** @type {(inputs: Ticket_Call_InitiatingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Starting call...`)
};

const es_ticket_call_initiating = /** @type {(inputs: Ticket_Call_InitiatingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Iniciando llamada...`)
};

/**
* | output |
* | --- |
* | "Starting call..." |
*
* @param {Ticket_Call_InitiatingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_call_initiating = /** @type {((inputs?: Ticket_Call_InitiatingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Call_InitiatingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_call_initiating(inputs)
	return es_ticket_call_initiating(inputs)
});