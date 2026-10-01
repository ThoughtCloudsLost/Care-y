/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Hub_Funds_SubtitleInputs */

const en_hub_funds_subtitle = /** @type {(inputs: Hub_Funds_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Funds, adjustments and entry notices`)
};

const es_hub_funds_subtitle = /** @type {(inputs: Hub_Funds_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fondos, ajustes y avisos de movimientos`)
};

const en_xa2_hub_funds_subtitle = /** @type {(inputs: Hub_Funds_SubtitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fùnds, àdjùstmènts ànd èntry nòtìcès •••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Funds, adjustments and entry notices" |
*
* @param {Hub_Funds_SubtitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const hub_funds_subtitle = /** @type {((inputs?: Hub_Funds_SubtitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Hub_Funds_SubtitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_hub_funds_subtitle(inputs)
	if (locale === "en-XA") return en_xa2_hub_funds_subtitle(inputs)
	return en_hub_funds_subtitle(inputs)
});