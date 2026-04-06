/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Filter_Date_ClearInputs */

const en_tickets_filter_date_clear = /** @type {(inputs: Tickets_Filter_Date_ClearInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Clear dates`)
};

const es_tickets_filter_date_clear = /** @type {(inputs: Tickets_Filter_Date_ClearInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Borrar fechas`)
};

/**
* | output |
* | --- |
* | "Clear dates" |
*
* @param {Tickets_Filter_Date_ClearInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_date_clear = /** @type {((inputs?: Tickets_Filter_Date_ClearInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Filter_Date_ClearInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_tickets_filter_date_clear(inputs)
	return es_tickets_filter_date_clear(inputs)
});