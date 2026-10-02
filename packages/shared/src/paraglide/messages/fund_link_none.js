/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Fund_Link_NoneInputs */

const en_fund_link_none = /** @type {(inputs: Fund_Link_NoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Not linked`)
};

const es_fund_link_none = /** @type {(inputs: Fund_Link_NoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin vincular`)
};

const en_xa2_fund_link_none = /** @type {(inputs: Fund_Link_NoneInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nòt lìnkèd •••⟧`)
};

/**
* | output |
* | --- |
* | "Not linked" |
*
* @param {Fund_Link_NoneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_link_none = /** @type {((inputs?: Fund_Link_NoneInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Fund_Link_NoneInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_fund_link_none(inputs)
	if (locale === "en-XA") return en_xa2_fund_link_none(inputs)
	return en_fund_link_none(inputs)
});