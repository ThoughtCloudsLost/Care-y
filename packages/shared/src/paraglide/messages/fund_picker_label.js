/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Fund_Picker_LabelInputs */

const en_fund_picker_label = /** @type {(inputs: Fund_Picker_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fund`)
};

const es_fund_picker_label = /** @type {(inputs: Fund_Picker_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fondo`)
};

const en_xa2_fund_picker_label = /** @type {(inputs: Fund_Picker_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fùnd ••⟧`)
};

/**
* | output |
* | --- |
* | "Fund" |
*
* @param {Fund_Picker_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const fund_picker_label = /** @type {((inputs?: Fund_Picker_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Fund_Picker_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_fund_picker_label(inputs)
	if (locale === "en-XA") return en_xa2_fund_picker_label(inputs)
	return en_fund_picker_label(inputs)
});