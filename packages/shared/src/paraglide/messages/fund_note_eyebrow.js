/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Fund_Note_EyebrowInputs */

const en_fund_note_eyebrow = /** @type {(inputs: Fund_Note_EyebrowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Disbursement`)
};

const es_fund_note_eyebrow = /** @type {(inputs: Fund_Note_EyebrowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Desembolso`)
};

const en_xa2_fund_note_eyebrow = /** @type {(inputs: Fund_Note_EyebrowInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dìsbùrsèmènt ••••⟧`)
};

/**
* | output |
* | --- |
* | "Disbursement" |
*
* @param {Fund_Note_EyebrowInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_note_eyebrow = /** @type {((inputs?: Fund_Note_EyebrowInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Fund_Note_EyebrowInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_fund_note_eyebrow(inputs)
	if (locale === "en-XA") return en_xa2_fund_note_eyebrow(inputs)
	return en_fund_note_eyebrow(inputs)
});