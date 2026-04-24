/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Detail_One_Volunteer_StatInputs */

const en_ticket_detail_one_volunteer_stat = /** @type {(inputs: Ticket_Detail_One_Volunteer_StatInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`1 volunteer`)
};

const es_ticket_detail_one_volunteer_stat = /** @type {(inputs: Ticket_Detail_One_Volunteer_StatInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`1 voluntario`)
};

/**
* | output |
* | --- |
* | "1 volunteer" |
*
* @param {Ticket_Detail_One_Volunteer_StatInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_detail_one_volunteer_stat = /** @type {((inputs?: Ticket_Detail_One_Volunteer_StatInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Detail_One_Volunteer_StatInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_detail_one_volunteer_stat(inputs)
	return es_ticket_detail_one_volunteer_stat(inputs)
});