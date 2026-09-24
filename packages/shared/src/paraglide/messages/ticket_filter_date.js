/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Filter_DateInputs */

const en_ticket_filter_date = /** @type {(inputs: Ticket_Filter_DateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Date`)
};

const es_ticket_filter_date = /** @type {(inputs: Ticket_Filter_DateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fecha`)
};

const en_xa2_ticket_filter_date = /** @type {(inputs: Ticket_Filter_DateInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dàtè ••⟧`)
};

/**
* | output |
* | --- |
* | "Date" |
*
* @param {Ticket_Filter_DateInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_filter_date = /** @type {((inputs?: Ticket_Filter_DateInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Filter_DateInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_filter_date(inputs)
	if (locale === "en-XA") return en_xa2_ticket_filter_date(inputs)
	return en_ticket_filter_date(inputs)
});