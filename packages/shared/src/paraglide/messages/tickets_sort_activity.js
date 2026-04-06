/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Sort_ActivityInputs */

const en_tickets_sort_activity = /** @type {(inputs: Tickets_Sort_ActivityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Recent activity`)
};

const es_tickets_sort_activity = /** @type {(inputs: Tickets_Sort_ActivityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Actividad reciente`)
};

/**
* | output |
* | --- |
* | "Recent activity" |
*
* @param {Tickets_Sort_ActivityInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_sort_activity = /** @type {((inputs?: Tickets_Sort_ActivityInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Sort_ActivityInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_tickets_sort_activity(inputs)
	return es_tickets_sort_activity(inputs)
});