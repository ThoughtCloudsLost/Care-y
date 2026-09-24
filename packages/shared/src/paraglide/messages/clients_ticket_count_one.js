/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown>, ticket: NonNullable<unknown> }} Clients_Ticket_Count_OneInputs */

const en_clients_ticket_count_one = /** @type {(inputs: Clients_Ticket_Count_OneInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} ${i?.ticket}`)
};

const es_clients_ticket_count_one = /** @type {(inputs: Clients_Ticket_Count_OneInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} ${i?.ticket}`)
};

const en_xa2_clients_ticket_count_one = /** @type {(inputs: Clients_Ticket_Count_OneInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count}  •${i?.ticket}⟧`)
};

/**
* | output |
* | --- |
* | "{count} {ticket}" |
*
* @param {Clients_Ticket_Count_OneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const clients_ticket_count_one = /** @type {((inputs: Clients_Ticket_Count_OneInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Clients_Ticket_Count_OneInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_clients_ticket_count_one(inputs)
	if (locale === "en-XA") return en_xa2_clients_ticket_count_one(inputs)
	return en_clients_ticket_count_one(inputs)
});