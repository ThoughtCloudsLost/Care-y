/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Filter_Date_RangeInputs */

const en_tickets_filter_date_range = /** @type {(inputs: Tickets_Filter_Date_RangeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Date`)
};

const es_tickets_filter_date_range = /** @type {(inputs: Tickets_Filter_Date_RangeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fecha`)
};

const en_xa2_tickets_filter_date_range = /** @type {(inputs: Tickets_Filter_Date_RangeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dàtè ••⟧`)
};

/**
* | output |
* | --- |
* | "Date" |
*
* @param {Tickets_Filter_Date_RangeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_date_range = /** @type {((inputs?: Tickets_Filter_Date_RangeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Filter_Date_RangeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_filter_date_range(inputs)
	if (locale === "en-XA") return en_xa2_tickets_filter_date_range(inputs)
	return en_tickets_filter_date_range(inputs)
});