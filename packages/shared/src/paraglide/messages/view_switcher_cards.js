/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} View_Switcher_CardsInputs */

const en_view_switcher_cards = /** @type {(inputs: View_Switcher_CardsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cards`)
};

const es_view_switcher_cards = /** @type {(inputs: View_Switcher_CardsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tarjetas`)
};

/**
* | output |
* | --- |
* | "Cards" |
*
* @param {View_Switcher_CardsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const view_switcher_cards = /** @type {((inputs?: View_Switcher_CardsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<View_Switcher_CardsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_view_switcher_cards(inputs)
	return es_view_switcher_cards(inputs)
});