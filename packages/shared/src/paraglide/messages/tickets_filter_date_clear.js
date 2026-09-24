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

const en_xa2_tickets_filter_date_clear = /** @type {(inputs: Tickets_Filter_Date_ClearInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Clèàr dàtès ••••⟧`)
};

/**
* | output |
* | --- |
* | "Clear dates" |
*
* @param {Tickets_Filter_Date_ClearInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_date_clear = /** @type {((inputs?: Tickets_Filter_Date_ClearInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Filter_Date_ClearInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_filter_date_clear(inputs)
	if (locale === "en-XA") return en_xa2_tickets_filter_date_clear(inputs)
	return en_tickets_filter_date_clear(inputs)
});