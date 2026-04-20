/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Panel_BlocklistInputs */

const en_panel_blocklist = /** @type {(inputs: Panel_BlocklistInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Blocklist`)
};

const es_panel_blocklist = /** @type {(inputs: Panel_BlocklistInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Lista de bloqueo`)
};

/**
* | output |
* | --- |
* | "Blocklist" |
*
* @param {Panel_BlocklistInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const panel_blocklist = /** @type {((inputs?: Panel_BlocklistInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Panel_BlocklistInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_panel_blocklist(inputs)
	return es_panel_blocklist(inputs)
});