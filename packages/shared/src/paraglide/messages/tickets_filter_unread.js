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

const en_xa2_tickets_filter_unread = /** @type {(inputs: Tickets_Filter_UnreadInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùnrèàd ••⟧`)
};

/**
* | output |
* | --- |
* | "Unread" |
*
* @param {Tickets_Filter_UnreadInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_unread = /** @type {((inputs?: Tickets_Filter_UnreadInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Filter_UnreadInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_filter_unread(inputs)
	if (locale === "en-XA") return en_xa2_tickets_filter_unread(inputs)
	return en_tickets_filter_unread(inputs)
});