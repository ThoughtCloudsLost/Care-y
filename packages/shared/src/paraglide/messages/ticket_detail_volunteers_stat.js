/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown>, volunteers: NonNullable<unknown> }} Ticket_Detail_Volunteers_StatInputs */

const en_ticket_detail_volunteers_stat = /** @type {(inputs: Ticket_Detail_Volunteers_StatInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} ${i?.volunteers}`)
};

const es_ticket_detail_volunteers_stat = /** @type {(inputs: Ticket_Detail_Volunteers_StatInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} ${i?.volunteers}`)
};

const en_xa2_ticket_detail_volunteers_stat = /** @type {(inputs: Ticket_Detail_Volunteers_StatInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count}  •${i?.volunteers}⟧`)
};

/**
* | output |
* | --- |
* | "{count} {volunteers}" |
*
* @param {Ticket_Detail_Volunteers_StatInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_detail_volunteers_stat = /** @type {((inputs: Ticket_Detail_Volunteers_StatInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Detail_Volunteers_StatInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_detail_volunteers_stat(inputs)
	if (locale === "en-XA") return en_xa2_ticket_detail_volunteers_stat(inputs)
	return en_ticket_detail_volunteers_stat(inputs)
});