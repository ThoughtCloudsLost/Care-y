/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Ticket_Filter_HiddenInputs */

const en_ticket_filter_hidden = /** @type {(inputs: Ticket_Filter_HiddenInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} filtered messages`)
};

const es_ticket_filter_hidden = /** @type {(inputs: Ticket_Filter_HiddenInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} mensajes filtrados`)
};

/**
* | output |
* | --- |
* | "{count} filtered messages" |
*
* @param {Ticket_Filter_HiddenInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_filter_hidden = /** @type {((inputs: Ticket_Filter_HiddenInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Filter_HiddenInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_filter_hidden(inputs)
	return es_ticket_filter_hidden(inputs)
});