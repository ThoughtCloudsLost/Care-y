/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Filter_Date_FromInputs */

const en_tickets_filter_date_from = /** @type {(inputs: Tickets_Filter_Date_FromInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`From`)
};

const es_tickets_filter_date_from = /** @type {(inputs: Tickets_Filter_Date_FromInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Desde`)
};

const en_xa2_tickets_filter_date_from = /** @type {(inputs: Tickets_Filter_Date_FromInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fròm ••⟧`)
};

/**
* | output |
* | --- |
* | "From" |
*
* @param {Tickets_Filter_Date_FromInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_date_from = /** @type {((inputs?: Tickets_Filter_Date_FromInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Filter_Date_FromInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_filter_date_from(inputs)
	if (locale === "en-XA") return en_xa2_tickets_filter_date_from(inputs)
	return en_tickets_filter_date_from(inputs)
});