/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Toast_Offer_UpdatedInputs */

const en_ticket_toast_offer_updated = /** @type {(inputs: Ticket_Toast_Offer_UpdatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Account offer updated`)
};

const es_ticket_toast_offer_updated = /** @type {(inputs: Ticket_Toast_Offer_UpdatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Oferta de cuenta actualizada`)
};

/**
* | output |
* | --- |
* | "Account offer updated" |
*
* @param {Ticket_Toast_Offer_UpdatedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_toast_offer_updated = /** @type {((inputs?: Ticket_Toast_Offer_UpdatedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Toast_Offer_UpdatedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_toast_offer_updated(inputs)
	return es_ticket_toast_offer_updated(inputs)
});