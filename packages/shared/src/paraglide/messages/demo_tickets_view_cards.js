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

const en_xa2_demo_tickets_view_cards = /** @type {(inputs: Demo_Tickets_View_CardsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Swìtchìng tò càrd vìèw •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Switching to card view" |
*
* @param {Demo_Tickets_View_CardsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_tickets_view_cards = /** @type {((inputs?: Demo_Tickets_View_CardsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Tickets_View_CardsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_tickets_view_cards(inputs)
	if (locale === "en-XA") return en_xa2_demo_tickets_view_cards(inputs)
	return en_demo_tickets_view_cards(inputs)
});