/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Hub_Blocklist_SubtitleInputs */

const en_hub_blocklist_subtitle = /** @type {(inputs: Hub_Blocklist_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Blocked numbers`)
};

const es_hub_blocklist_subtitle = /** @type {(inputs: Hub_Blocklist_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Números bloqueados`)
};

const en_xa2_hub_blocklist_subtitle = /** @type {(inputs: Hub_Blocklist_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Blòckèd nùmbèrs •••••⟧`)
};

/**
* | output |
* | --- |
* | "Blocked numbers" |
*
* @param {Hub_Blocklist_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const hub_blocklist_subtitle = /** @type {((inputs?: Hub_Blocklist_SubtitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Hub_Blocklist_SubtitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_hub_blocklist_subtitle(inputs)
	if (locale === "en-XA") return en_xa2_hub_blocklist_subtitle(inputs)
	return en_hub_blocklist_subtitle(inputs)
});