/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Unread_Zero_StampInputs */

const en_tickets_unread_zero_stamp = /** @type {(inputs: Tickets_Unread_Zero_StampInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`All caught up`)
};

const es_tickets_unread_zero_stamp = /** @type {(inputs: Tickets_Unread_Zero_StampInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Al día`)
};

const en_xa2_tickets_unread_zero_stamp = /** @type {(inputs: Tickets_Unread_Zero_StampInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àll càùght ùp ••••⟧`)
};

/**
* | output |
* | --- |
* | "All caught up" |
*
* @param {Tickets_Unread_Zero_StampInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_unread_zero_stamp = /** @type {((inputs?: Tickets_Unread_Zero_StampInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Unread_Zero_StampInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_unread_zero_stamp(inputs)
	if (locale === "en-XA") return en_xa2_tickets_unread_zero_stamp(inputs)
	return en_tickets_unread_zero_stamp(inputs)
});