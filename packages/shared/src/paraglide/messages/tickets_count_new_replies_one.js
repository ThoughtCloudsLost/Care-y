/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Count_New_Replies_OneInputs */

const en_tickets_count_new_replies_one = /** @type {(inputs: Tickets_Count_New_Replies_OneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`with a new reply`)
};

const es_tickets_count_new_replies_one = /** @type {(inputs: Tickets_Count_New_Replies_OneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`con una respuesta nueva`)
};

/**
* | output |
* | --- |
* | "with a new reply" |
*
* @param {Tickets_Count_New_Replies_OneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_count_new_replies_one = /** @type {((inputs?: Tickets_Count_New_Replies_OneInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Count_New_Replies_OneInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_tickets_count_new_replies_one(inputs)
	return es_tickets_count_new_replies_one(inputs)
});