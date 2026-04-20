/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Hub_Blocklist_SubtitleInputs */

const en_hub_blocklist_subtitle = /** @type {(inputs: Hub_Blocklist_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Blocked numbers`)
};

const es_hub_blocklist_subtitle = /** @type {(inputs: Hub_Blocklist_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Numeros bloqueados`)
};

/**
* | output |
* | --- |
* | "Blocked numbers" |
*
* @param {Hub_Blocklist_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const hub_blocklist_subtitle = /** @type {((inputs?: Hub_Blocklist_SubtitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Hub_Blocklist_SubtitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_hub_blocklist_subtitle(inputs)
	return es_hub_blocklist_subtitle(inputs)
});