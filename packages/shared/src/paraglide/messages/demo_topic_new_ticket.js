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

const en_xa2_demo_topic_new_ticket = /** @type {(inputs: Demo_Topic_New_TicketInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nèw tìckèt •••⟧`)
};

/**
* | output |
* | --- |
* | "New ticket" |
*
* @param {Demo_Topic_New_TicketInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_topic_new_ticket = /** @type {((inputs?: Demo_Topic_New_TicketInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Topic_New_TicketInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_topic_new_ticket(inputs)
	if (locale === "en-XA") return en_xa2_demo_topic_new_ticket(inputs)
	return en_demo_topic_new_ticket(inputs)
});