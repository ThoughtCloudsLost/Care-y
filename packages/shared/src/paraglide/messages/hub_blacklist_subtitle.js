/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Hub_Blacklist_SubtitleInputs */

const en_hub_blacklist_subtitle = /** @type {(inputs: Hub_Blacklist_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Blocked numbers`)
};

const es_hub_blacklist_subtitle = /** @type {(inputs: Hub_Blacklist_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Numeros bloqueados`)
};

/**
* | output |
* | --- |
* | "Blocked numbers" |
*
* @param {Hub_Blacklist_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const hub_blacklist_subtitle = /** @type {((inputs?: Hub_Blacklist_SubtitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Hub_Blacklist_SubtitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_hub_blacklist_subtitle(inputs)
	return es_hub_blacklist_subtitle(inputs)
});