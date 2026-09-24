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

const en_xa2_view_switcher_cards = /** @type {(inputs: View_Switcher_CardsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Càrds ••⟧`)
};

/**
* | output |
* | --- |
* | "Cards" |
*
* @param {View_Switcher_CardsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const view_switcher_cards = /** @type {((inputs?: View_Switcher_CardsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<View_Switcher_CardsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_view_switcher_cards(inputs)
	if (locale === "en-XA") return en_xa2_view_switcher_cards(inputs)
	return en_view_switcher_cards(inputs)
});