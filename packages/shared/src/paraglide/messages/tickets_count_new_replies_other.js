/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Count_New_Replies_OtherInputs */

const en_tickets_count_new_replies_other = /** @type {(inputs: Tickets_Count_New_Replies_OtherInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`unread`)
};

const es_tickets_count_new_replies_other = /** @type {(inputs: Tickets_Count_New_Replies_OtherInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`sin leer`)
};

const en_xa2_tickets_count_new_replies_other = /** @type {(inputs: Tickets_Count_New_Replies_OtherInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦ùnrèàd ••⟧`)
};

/**
* | output |
* | --- |
* | "unread" |
*
* @param {Tickets_Count_New_Replies_OtherInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_count_new_replies_other = /** @type {((inputs?: Tickets_Count_New_Replies_OtherInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Count_New_Replies_OtherInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_count_new_replies_other(inputs)
	if (locale === "en-XA") return en_xa2_tickets_count_new_replies_other(inputs)
	return en_tickets_count_new_replies_other(inputs)
});