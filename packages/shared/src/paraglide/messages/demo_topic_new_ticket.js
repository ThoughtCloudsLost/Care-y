/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Topic_New_TicketInputs */

const en_demo_topic_new_ticket = /** @type {(inputs: Demo_Topic_New_TicketInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`New ticket`)
};

const es_demo_topic_new_ticket = /** @type {(inputs: Demo_Topic_New_TicketInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nuevo ticket`)
};

/**
* | output |
* | --- |
* | "New ticket" |
*
* @param {Demo_Topic_New_TicketInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_topic_new_ticket = /** @type {((inputs?: Demo_Topic_New_TicketInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Topic_New_TicketInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_topic_new_ticket(inputs)
	return es_demo_topic_new_ticket(inputs)
});