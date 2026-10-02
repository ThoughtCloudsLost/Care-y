/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Deepdive_Fund_Records_HeadingInputs */

const en_demo_narrative_deepdive_fund_records_heading = /** @type {(inputs: Demo_Narrative_Deepdive_Fund_Records_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`What the server holds about money`)
};

const es_demo_narrative_deepdive_fund_records_heading = /** @type {(inputs: Demo_Narrative_Deepdive_Fund_Records_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Lo que el servidor guarda sobre el dinero`)
};

const en_xa2_demo_narrative_deepdive_fund_records_heading = /** @type {(inputs: Demo_Narrative_Deepdive_Fund_Records_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Whàt thè sèrvèr hòlds àbòùt mònèy ••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "What the server holds about money" |
*
* @param {Demo_Narrative_Deepdive_Fund_Records_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_deepdive_fund_records_heading = /** @type {((inputs?: Demo_Narrative_Deepdive_Fund_Records_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Deepdive_Fund_Records_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_deepdive_fund_records_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_deepdive_fund_records_heading(inputs)
	return en_demo_narrative_deepdive_fund_records_heading(inputs)
});