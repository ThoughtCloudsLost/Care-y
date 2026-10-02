/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Fund_Link_UnavailableInputs */

const en_fund_link_unavailable = /** @type {(inputs: Fund_Link_UnavailableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Donation provider funds could not be loaded. The current link is kept when you save.`)
};

const es_fund_link_unavailable = /** @type {(inputs: Fund_Link_UnavailableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No se pudieron cargar los fondos del proveedor de donaciones. Al guardar se mantiene el vínculo actual.`)
};

const en_xa2_fund_link_unavailable = /** @type {(inputs: Fund_Link_UnavailableInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dònàtìòn pròvìdèr fùnds còùld nòt bè lòàdèd. Thè cùrrènt lìnk ìs kèpt whèn yòù sàvè. ••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Donation provider funds could not be loaded. The current link is kept when you save." |
*
* @param {Fund_Link_UnavailableInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_link_unavailable = /** @type {((inputs?: Fund_Link_UnavailableInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Fund_Link_UnavailableInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_fund_link_unavailable(inputs)
	if (locale === "en-XA") return en_xa2_fund_link_unavailable(inputs)
	return en_fund_link_unavailable(inputs)
});