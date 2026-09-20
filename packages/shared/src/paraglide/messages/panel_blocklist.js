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

const en_xa2_panel_blocklist = /** @type {(inputs: Panel_BlocklistInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Blòcklìst •••⟧`)
};

/**
* | output |
* | --- |
* | "Blocklist" |
*
* @param {Panel_BlocklistInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const panel_blocklist = /** @type {((inputs?: Panel_BlocklistInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Panel_BlocklistInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_panel_blocklist(inputs)
	if (locale === "en-XA") return en_xa2_panel_blocklist(inputs)
	return en_panel_blocklist(inputs)
});