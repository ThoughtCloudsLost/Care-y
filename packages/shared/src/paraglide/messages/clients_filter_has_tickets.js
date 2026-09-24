/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ tickets: NonNullable<unknown> }} Clients_Filter_Has_TicketsInputs */

const en_clients_filter_has_tickets = /** @type {(inputs: Clients_Filter_Has_TicketsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Has ${i?.tickets}`)
};

const es_clients_filter_has_tickets = /** @type {(inputs: Clients_Filter_Has_TicketsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Tiene ${i?.tickets}`)
};

const en_xa2_clients_filter_has_tickets = /** @type {(inputs: Clients_Filter_Has_TicketsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Hàs  ••${i?.tickets}⟧`)
};

/**
* | output |
* | --- |
* | "Has {tickets}" |
*
* @param {Clients_Filter_Has_TicketsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const clients_filter_has_tickets = /** @type {((inputs: Clients_Filter_Has_TicketsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Clients_Filter_Has_TicketsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_clients_filter_has_tickets(inputs)
	if (locale === "en-XA") return en_xa2_clients_filter_has_tickets(inputs)
	return en_clients_filter_has_tickets(inputs)
});