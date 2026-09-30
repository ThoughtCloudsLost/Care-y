/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Deepdive_Data_Retention_HeadingInputs */

const en_demo_narrative_deepdive_data_retention_heading = /** @type {(inputs: Demo_Narrative_Deepdive_Data_Retention_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Data retention`)
};

const es_demo_narrative_deepdive_data_retention_heading = /** @type {(inputs: Demo_Narrative_Deepdive_Data_Retention_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Retención de datos`)
};

const en_xa2_demo_narrative_deepdive_data_retention_heading = /** @type {(inputs: Demo_Narrative_Deepdive_Data_Retention_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dàtà rètèntìòn •••••⟧`)
};

/**
* | output |
* | --- |
* | "Data retention" |
*
* @param {Demo_Narrative_Deepdive_Data_Retention_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_deepdive_data_retention_heading = /** @type {((inputs?: Demo_Narrative_Deepdive_Data_Retention_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Deepdive_Data_Retention_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_deepdive_data_retention_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_deepdive_data_retention_heading(inputs)
	return en_demo_narrative_deepdive_data_retention_heading(inputs)
});