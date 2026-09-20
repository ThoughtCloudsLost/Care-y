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

const en_xa2_tickets_sort_status = /** @type {(inputs: Tickets_Sort_StatusInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Stàtùs ••⟧`)
};

/**
* | output |
* | --- |
* | "Status" |
*
* @param {Tickets_Sort_StatusInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_sort_status = /** @type {((inputs?: Tickets_Sort_StatusInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Sort_StatusInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_sort_status(inputs)
	if (locale === "en-XA") return en_xa2_tickets_sort_status(inputs)
	return en_tickets_sort_status(inputs)
});