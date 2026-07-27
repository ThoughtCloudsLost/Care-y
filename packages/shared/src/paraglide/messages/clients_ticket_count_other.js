/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown>, tickets: NonNullable<unknown> }} Clients_Ticket_Count_OtherInputs */

const en_clients_ticket_count_other = /** @type {(inputs: Clients_Ticket_Count_OtherInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} ${i?.tickets}`)
};

const es_clients_ticket_count_other = /** @type {(inputs: Clients_Ticket_Count_OtherInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} ${i?.tickets}`)
};

/**
* | output |
* | --- |
* | "{count} {tickets}" |
*
* @param {Clients_Ticket_Count_OtherInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const clients_ticket_count_other = /** @type {((inputs: Clients_Ticket_Count_OtherInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Clients_Ticket_Count_OtherInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_clients_ticket_count_other(inputs)
	return es_clients_ticket_count_other(inputs)
});