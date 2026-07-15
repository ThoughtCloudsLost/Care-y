/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Sort_MsgsInputs */

const en_tickets_sort_msgs = /** @type {(inputs: Tickets_Sort_MsgsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Message count`)
};

const es_tickets_sort_msgs = /** @type {(inputs: Tickets_Sort_MsgsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cantidad de mensajes`)
};

/**
* | output |
* | --- |
* | "Message count" |
*
* @param {Tickets_Sort_MsgsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_sort_msgs = /** @type {((inputs?: Tickets_Sort_MsgsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Sort_MsgsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_tickets_sort_msgs(inputs)
	return es_tickets_sort_msgs(inputs)
});