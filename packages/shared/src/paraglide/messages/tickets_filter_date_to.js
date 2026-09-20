/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Filter_Date_ToInputs */

const en_tickets_filter_date_to = /** @type {(inputs: Tickets_Filter_Date_ToInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`To`)
};

const es_tickets_filter_date_to = /** @type {(inputs: Tickets_Filter_Date_ToInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Hasta`)
};

const en_xa2_tickets_filter_date_to = /** @type {(inputs: Tickets_Filter_Date_ToInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tò •⟧`)
};

/**
* | output |
* | --- |
* | "To" |
*
* @param {Tickets_Filter_Date_ToInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_date_to = /** @type {((inputs?: Tickets_Filter_Date_ToInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Filter_Date_ToInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_filter_date_to(inputs)
	if (locale === "en-XA") return en_xa2_tickets_filter_date_to(inputs)
	return en_tickets_filter_date_to(inputs)
});