/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Filter_UnreadInputs */

const en_tickets_filter_unread = /** @type {(inputs: Tickets_Filter_UnreadInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Unread`)
};

const es_tickets_filter_unread = /** @type {(inputs: Tickets_Filter_UnreadInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin leer`)
};

/**
* | output |
* | --- |
* | "Unread" |
*
* @param {Tickets_Filter_UnreadInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_unread = /** @type {((inputs?: Tickets_Filter_UnreadInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Filter_UnreadInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_tickets_filter_unread(inputs)
	return es_tickets_filter_unread(inputs)
});