/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Count_New_Replies_OneInputs */

const en_tickets_count_new_replies_one = /** @type {(inputs: Tickets_Count_New_Replies_OneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`unread`)
};

const es_tickets_count_new_replies_one = /** @type {(inputs: Tickets_Count_New_Replies_OneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`sin leer`)
};

const en_xa2_tickets_count_new_replies_one = /** @type {(inputs: Tickets_Count_New_Replies_OneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦ùnrèàd ••⟧`)
};

/**
* | output |
* | --- |
* | "unread" |
*
* @param {Tickets_Count_New_Replies_OneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_count_new_replies_one = /** @type {((inputs?: Tickets_Count_New_Replies_OneInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Count_New_Replies_OneInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_count_new_replies_one(inputs)
	if (locale === "en-XA") return en_xa2_tickets_count_new_replies_one(inputs)
	return en_tickets_count_new_replies_one(inputs)
});