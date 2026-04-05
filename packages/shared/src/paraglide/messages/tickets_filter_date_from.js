/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Filter_Date_FromInputs */

const en_tickets_filter_date_from = /** @type {(inputs: Tickets_Filter_Date_FromInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`From`)
};

/** @type {(inputs: Tickets_Filter_Date_FromInputs) => LocalizedString} */
const es_tickets_filter_date_from = en_tickets_filter_date_from;

/**
* | output |
* | --- |
* | "From" |
*
* @param {Tickets_Filter_Date_FromInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_date_from = /** @type {((inputs?: Tickets_Filter_Date_FromInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Filter_Date_FromInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_tickets_filter_date_from(inputs)
	return es_tickets_filter_date_from(inputs)
});