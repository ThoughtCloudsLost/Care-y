/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Create_ShortcutInputs */

const en_tickets_create_shortcut = /** @type {(inputs: Tickets_Create_ShortcutInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Save filter shortcut`)
};

const es_tickets_create_shortcut = /** @type {(inputs: Tickets_Create_ShortcutInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Guardar filtro`)
};

/**
* | output |
* | --- |
* | "Save filter shortcut" |
*
* @param {Tickets_Create_ShortcutInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const tickets_create_shortcut = /** @type {((inputs?: Tickets_Create_ShortcutInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Create_ShortcutInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_tickets_create_shortcut(inputs)
	return es_tickets_create_shortcut(inputs)
});