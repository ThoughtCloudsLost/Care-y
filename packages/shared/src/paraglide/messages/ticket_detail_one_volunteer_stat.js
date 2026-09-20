/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ volunteer: NonNullable<unknown> }} Ticket_Detail_One_Volunteer_StatInputs */

const en_ticket_detail_one_volunteer_stat = /** @type {(inputs: Ticket_Detail_One_Volunteer_StatInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`1 ${i?.volunteer}`)
};

const es_ticket_detail_one_volunteer_stat = /** @type {(inputs: Ticket_Detail_One_Volunteer_StatInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`1 ${i?.volunteer}`)
};

const en_xa2_ticket_detail_one_volunteer_stat = /** @type {(inputs: Ticket_Detail_One_Volunteer_StatInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦1  •${i?.volunteer}⟧`)
};

/**
* | output |
* | --- |
* | "1 {volunteer}" |
*
* @param {Ticket_Detail_One_Volunteer_StatInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_detail_one_volunteer_stat = /** @type {((inputs: Ticket_Detail_One_Volunteer_StatInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Detail_One_Volunteer_StatInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_detail_one_volunteer_stat(inputs)
	if (locale === "en-XA") return en_xa2_ticket_detail_one_volunteer_stat(inputs)
	return en_ticket_detail_one_volunteer_stat(inputs)
});