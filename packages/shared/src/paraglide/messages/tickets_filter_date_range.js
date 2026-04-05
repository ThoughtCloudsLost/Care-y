/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Filter_Date_RangeInputs */

const en_tickets_filter_date_range = /** @type {(inputs: Tickets_Filter_Date_RangeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Date`)
};

/** @type {(inputs: Tickets_Filter_Date_RangeInputs) => LocalizedString} */
const es_tickets_filter_date_range = en_tickets_filter_date_range;

/**
* | output |
* | --- |
* | "Date" |
*
* @param {Tickets_Filter_Date_RangeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_date_range = /** @type {((inputs?: Tickets_Filter_Date_RangeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Filter_Date_RangeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_tickets_filter_date_range(inputs)
	return es_tickets_filter_date_range(inputs)
});