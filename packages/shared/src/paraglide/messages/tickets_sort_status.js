/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Sort_StatusInputs */

const en_tickets_sort_status = /** @type {(inputs: Tickets_Sort_StatusInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Status`)
};

const es_tickets_sort_status = /** @type {(inputs: Tickets_Sort_StatusInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Estado`)
};

/**
* | output |
* | --- |
* | "Status" |
*
* @param {Tickets_Sort_StatusInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_sort_status = /** @type {((inputs?: Tickets_Sort_StatusInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Sort_StatusInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_tickets_sort_status(inputs)
	return es_tickets_sort_status(inputs)
});