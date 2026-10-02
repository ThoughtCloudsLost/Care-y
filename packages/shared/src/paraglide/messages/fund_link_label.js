/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Fund_Link_LabelInputs */

const en_fund_link_label = /** @type {(inputs: Fund_Link_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Linked to`)
};

const es_fund_link_label = /** @type {(inputs: Fund_Link_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vinculado a`)
};

const en_xa2_fund_link_label = /** @type {(inputs: Fund_Link_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Lìnkèd tò •••⟧`)
};

/**
* | output |
* | --- |
* | "Linked to" |
*
* @param {Fund_Link_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_link_label = /** @type {((inputs?: Fund_Link_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Fund_Link_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_fund_link_label(inputs)
	if (locale === "en-XA") return en_xa2_fund_link_label(inputs)
	return en_fund_link_label(inputs)
});