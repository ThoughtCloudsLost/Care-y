/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Fund_Link_MissingInputs */

const en_fund_link_missing = /** @type {(inputs: Fund_Link_MissingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Current link (not listed)`)
};

const es_fund_link_missing = /** @type {(inputs: Fund_Link_MissingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vínculo actual (no aparece en la lista)`)
};

const en_xa2_fund_link_missing = /** @type {(inputs: Fund_Link_MissingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Cùrrènt lìnk (nòt lìstèd) ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Current link (not listed)" |
*
* @param {Fund_Link_MissingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_link_missing = /** @type {((inputs?: Fund_Link_MissingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Fund_Link_MissingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_fund_link_missing(inputs)
	if (locale === "en-XA") return en_xa2_fund_link_missing(inputs)
	return en_fund_link_missing(inputs)
});