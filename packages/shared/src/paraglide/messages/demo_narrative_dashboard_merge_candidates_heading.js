/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Merge_Candidates_HeadingInputs */

const en_demo_narrative_dashboard_merge_candidates_heading = /** @type {(inputs: Demo_Narrative_Dashboard_Merge_Candidates_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Possible duplicates`)
};

const es_demo_narrative_dashboard_merge_candidates_heading = /** @type {(inputs: Demo_Narrative_Dashboard_Merge_Candidates_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Posibles duplicados`)
};

const en_xa2_demo_narrative_dashboard_merge_candidates_heading = /** @type {(inputs: Demo_Narrative_Dashboard_Merge_Candidates_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Pòssìblè dùplìcàtès ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Possible duplicates" |
*
* @param {Demo_Narrative_Dashboard_Merge_Candidates_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_merge_candidates_heading = /** @type {((inputs?: Demo_Narrative_Dashboard_Merge_Candidates_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_Merge_Candidates_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_dashboard_merge_candidates_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_dashboard_merge_candidates_heading(inputs)
	return en_demo_narrative_dashboard_merge_candidates_heading(inputs)
});