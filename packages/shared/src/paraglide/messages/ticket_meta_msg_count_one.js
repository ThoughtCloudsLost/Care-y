/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Ticket_Meta_Msg_Count_OneInputs */

const en_ticket_meta_msg_count_one = /** @type {(inputs: Ticket_Meta_Msg_Count_OneInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} msg`)
};

const es_ticket_meta_msg_count_one = /** @type {(inputs: Ticket_Meta_Msg_Count_OneInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} mensaje`)
};

/**
* | output |
* | --- |
* | "{count} msg" |
*
* @param {Ticket_Meta_Msg_Count_OneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_meta_msg_count_one = /** @type {((inputs: Ticket_Meta_Msg_Count_OneInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Meta_Msg_Count_OneInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_meta_msg_count_one(inputs)
	return es_ticket_meta_msg_count_one(inputs)
});