/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Clients_Sort_TicketsInputs */

const en_clients_sort_tickets = /** @type {(inputs: Clients_Sort_TicketsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ticket count`)
};

const es_clients_sort_tickets = /** @type {(inputs: Clients_Sort_TicketsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cantidad de tickets`)
};

/**
* | output |
* | --- |
* | "Ticket count" |
*
* @param {Clients_Sort_TicketsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const clients_sort_tickets = /** @type {((inputs?: Clients_Sort_TicketsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Clients_Sort_TicketsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_clients_sort_tickets(inputs)
	return es_clients_sort_tickets(inputs)
});