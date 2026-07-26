/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ tickets: NonNullable<unknown> }} Clients_Filter_Has_Tickets_YesInputs */

const en_clients_filter_has_tickets_yes = /** @type {(inputs: Clients_Filter_Has_Tickets_YesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`With ${i?.tickets}`)
};

const es_clients_filter_has_tickets_yes = /** @type {(inputs: Clients_Filter_Has_Tickets_YesInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Con ${i?.tickets}`)
};

/**
* | output |
* | --- |
* | "With {tickets}" |
*
* @param {Clients_Filter_Has_Tickets_YesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const clients_filter_has_tickets_yes = /** @type {((inputs: Clients_Filter_Has_Tickets_YesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Clients_Filter_Has_Tickets_YesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_clients_filter_has_tickets_yes(inputs)
	return es_clients_filter_has_tickets_yes(inputs)
});