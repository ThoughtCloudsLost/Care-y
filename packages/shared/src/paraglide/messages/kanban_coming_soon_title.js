/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Kanban_Coming_Soon_TitleInputs */

const en_kanban_coming_soon_title = /** @type {(inputs: Kanban_Coming_Soon_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Kanban board`)
};

const es_kanban_coming_soon_title = /** @type {(inputs: Kanban_Coming_Soon_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tablero kanban`)
};

const en_xa2_kanban_coming_soon_title = /** @type {(inputs: Kanban_Coming_Soon_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Kànbàn bòàrd ••••⟧`)
};

/**
* | output |
* | --- |
* | "Kanban board" |
*
* @param {Kanban_Coming_Soon_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const kanban_coming_soon_title = /** @type {((inputs?: Kanban_Coming_Soon_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Kanban_Coming_Soon_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_kanban_coming_soon_title(inputs)
	if (locale === "en-XA") return en_xa2_kanban_coming_soon_title(inputs)
	return en_kanban_coming_soon_title(inputs)
});