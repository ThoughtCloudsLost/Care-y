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

const en_xa2_ticket_call_initiating = /** @type {(inputs: Ticket_Call_InitiatingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Stàrtìng càll... •••••⟧`)
};

/**
* | output |
* | --- |
* | "Starting call..." |
*
* @param {Ticket_Call_InitiatingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_call_initiating = /** @type {((inputs?: Ticket_Call_InitiatingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Call_InitiatingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_call_initiating(inputs)
	if (locale === "en-XA") return en_xa2_ticket_call_initiating(inputs)
	return en_ticket_call_initiating(inputs)
});