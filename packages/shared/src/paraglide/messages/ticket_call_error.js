/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Call_ErrorInputs */

const en_ticket_call_error = /** @type {(inputs: Ticket_Call_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Call failed. Try again.`)
};

const es_ticket_call_error = /** @type {(inputs: Ticket_Call_ErrorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La llamada fallo. Intenta de nuevo.`)
};

/**
* | output |
* | --- |
* | "Call failed. Try again." |
*
* @param {Ticket_Call_ErrorInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_call_error = /** @type {((inputs?: Ticket_Call_ErrorInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Call_ErrorInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_call_error(inputs)
	return es_ticket_call_error(inputs)
});