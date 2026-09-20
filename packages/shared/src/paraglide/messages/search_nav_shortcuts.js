/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Search_Nav_ShortcutsInputs */

const en_search_nav_shortcuts = /** @type {(inputs: Search_Nav_ShortcutsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enter for next, Shift+Enter for previous, Escape to close`)
};

const es_search_nav_shortcuts = /** @type {(inputs: Search_Nav_ShortcutsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enter para siguiente, Shift+Enter para anterior, Escape para cerrar`)
};

const en_xa2_search_nav_shortcuts = /** @type {(inputs: Search_Nav_ShortcutsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èntèr fòr nèxt, Shìft+Èntèr fòr prèvìòùs, Èscàpè tò clòsè ••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Enter for next, Shift+Enter for previous, Escape to close" |
*
* @param {Search_Nav_ShortcutsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const search_nav_shortcuts = /** @type {((inputs?: Search_Nav_ShortcutsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Search_Nav_ShortcutsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_search_nav_shortcuts(inputs)
	if (locale === "en-XA") return en_xa2_search_nav_shortcuts(inputs)
	return en_search_nav_shortcuts(inputs)
});