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

const en_xa2_clients_sort_tickets = /** @type {(inputs: Clients_Sort_TicketsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tìckèt còùnt ••••⟧`)
};

/**
* | output |
* | --- |
* | "Ticket count" |
*
* @param {Clients_Sort_TicketsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const clients_sort_tickets = /** @type {((inputs?: Clients_Sort_TicketsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Clients_Sort_TicketsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_clients_sort_tickets(inputs)
	if (locale === "en-XA") return en_xa2_clients_sort_tickets(inputs)
	return en_clients_sort_tickets(inputs)
});