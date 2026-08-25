/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Case_Fold_HeadingInputs */

const en_demo_narrative_topic_case_fold_heading = /** @type {(inputs: Demo_Narrative_Topic_Case_Fold_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Folding details away`)
};

const es_demo_narrative_topic_case_fold_heading = /** @type {(inputs: Demo_Narrative_Topic_Case_Fold_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Plegar los detalles`)
};

/**
* | output |
* | --- |
* | "Folding details away" |
*
* @param {Demo_Narrative_Topic_Case_Fold_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_case_fold_heading = /** @type {((inputs?: Demo_Narrative_Topic_Case_Fold_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Case_Fold_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_case_fold_heading(inputs)
	return es_demo_narrative_topic_case_fold_heading(inputs)
});