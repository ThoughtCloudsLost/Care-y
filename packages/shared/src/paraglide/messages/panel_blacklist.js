/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Panel_BlacklistInputs */

const en_panel_blacklist = /** @type {(inputs: Panel_BlacklistInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Blacklist`)
};

const es_panel_blacklist = /** @type {(inputs: Panel_BlacklistInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Lista negra`)
};

/**
* | output |
* | --- |
* | "Blacklist" |
*
* @param {Panel_BlacklistInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const panel_blacklist = /** @type {((inputs?: Panel_BlacklistInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Panel_BlacklistInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_panel_blacklist(inputs)
	return es_panel_blacklist(inputs)
});