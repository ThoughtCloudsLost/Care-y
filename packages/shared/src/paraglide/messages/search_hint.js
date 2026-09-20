/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ tickets: NonNullable<unknown> }} Search_HintInputs */

const en_search_hint = /** @type {(inputs: Search_HintInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Search ${i?.tickets} and articles unlocked on this device`)
};

const es_search_hint = /** @type {(inputs: Search_HintInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Buscar ${i?.tickets} y artículos desbloqueados en este dispositivo`)
};

const en_xa2_search_hint = /** @type {(inputs: Search_HintInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Sèàrch  •••${i?.tickets} ànd àrtìclès ùnlòckèd òn thìs dèvìcè ••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Search {tickets} and articles unlocked on this device" |
*
* @param {Search_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_hint = /** @type {((inputs: Search_HintInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_HintInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_search_hint(inputs)
	if (locale === "en-XA") return en_xa2_search_hint(inputs)
	return en_search_hint(inputs)
});