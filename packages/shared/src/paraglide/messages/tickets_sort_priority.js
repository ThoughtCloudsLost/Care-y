/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Sort_PriorityInputs */

const en_tickets_sort_priority = /** @type {(inputs: Tickets_Sort_PriorityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Priority`)
};

const es_tickets_sort_priority = /** @type {(inputs: Tickets_Sort_PriorityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Prioridad`)
};

/**
* | output |
* | --- |
* | "Priority" |
*
* @param {Tickets_Sort_PriorityInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_sort_priority = /** @type {((inputs?: Tickets_Sort_PriorityInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Sort_PriorityInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_tickets_sort_priority(inputs)
	return es_tickets_sort_priority(inputs)
});