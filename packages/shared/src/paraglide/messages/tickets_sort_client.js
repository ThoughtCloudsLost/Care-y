/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Sort_ClientInputs */

const en_tickets_sort_client = /** @type {(inputs: Tickets_Sort_ClientInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Client alias`)
};

const es_tickets_sort_client = /** @type {(inputs: Tickets_Sort_ClientInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Alias de cliente`)
};

/**
* | output |
* | --- |
* | "Client alias" |
*
* @param {Tickets_Sort_ClientInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_sort_client = /** @type {((inputs?: Tickets_Sort_ClientInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Sort_ClientInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_tickets_sort_client(inputs)
	return es_tickets_sort_client(inputs)
});