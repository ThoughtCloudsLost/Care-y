/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ tickets: NonNullable<unknown> }} Clients_Filter_Has_Tickets_NoInputs */

const en_clients_filter_has_tickets_no = /** @type {(inputs: Clients_Filter_Has_Tickets_NoInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Without ${i?.tickets}`)
};

const es_clients_filter_has_tickets_no = /** @type {(inputs: Clients_Filter_Has_Tickets_NoInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Sin ${i?.tickets}`)
};

const en_xa2_clients_filter_has_tickets_no = /** @type {(inputs: Clients_Filter_Has_Tickets_NoInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Wìthòùt  •••${i?.tickets}⟧`)
};

/**
* | output |
* | --- |
* | "Without {tickets}" |
*
* @param {Clients_Filter_Has_Tickets_NoInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const clients_filter_has_tickets_no = /** @type {((inputs: Clients_Filter_Has_Tickets_NoInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Clients_Filter_Has_Tickets_NoInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_clients_filter_has_tickets_no(inputs)
	if (locale === "en-XA") return en_xa2_clients_filter_has_tickets_no(inputs)
	return en_clients_filter_has_tickets_no(inputs)
});