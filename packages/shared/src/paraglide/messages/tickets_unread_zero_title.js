/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Unread_Zero_TitleInputs */

const en_tickets_unread_zero_title = /** @type {(inputs: Tickets_Unread_Zero_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`You've read every new reply`)
};

const es_tickets_unread_zero_title = /** @type {(inputs: Tickets_Unread_Zero_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Has leído todas las respuestas nuevas`)
};

/**
* | output |
* | --- |
* | "You've read every new reply" |
*
* @param {Tickets_Unread_Zero_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_unread_zero_title = /** @type {((inputs?: Tickets_Unread_Zero_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Unread_Zero_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_tickets_unread_zero_title(inputs)
	return es_tickets_unread_zero_title(inputs)
});