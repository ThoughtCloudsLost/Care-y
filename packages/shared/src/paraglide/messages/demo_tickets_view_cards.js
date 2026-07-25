/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Tickets_View_CardsInputs */

const en_demo_tickets_view_cards = /** @type {(inputs: Demo_Tickets_View_CardsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Switching to card view`)
};

const es_demo_tickets_view_cards = /** @type {(inputs: Demo_Tickets_View_CardsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambiando a vista de tarjetas`)
};

/**
* | output |
* | --- |
* | "Switching to card view" |
*
* @param {Demo_Tickets_View_CardsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_tickets_view_cards = /** @type {((inputs?: Demo_Tickets_View_CardsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Tickets_View_CardsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_tickets_view_cards(inputs)
	return es_demo_tickets_view_cards(inputs)
});