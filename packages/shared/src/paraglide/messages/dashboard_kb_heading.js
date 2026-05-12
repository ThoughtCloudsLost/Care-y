/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ KnowledgeBase: NonNullable<unknown> }} Dashboard_Kb_HeadingInputs */

const en_dashboard_kb_heading = /** @type {(inputs: Dashboard_Kb_HeadingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.KnowledgeBase}`)
};

const es_dashboard_kb_heading = /** @type {(inputs: Dashboard_Kb_HeadingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.KnowledgeBase}`)
};

/**
* | output |
* | --- |
* | "{KnowledgeBase}" |
*
* @param {Dashboard_Kb_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_kb_heading = /** @type {((inputs: Dashboard_Kb_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Kb_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_dashboard_kb_heading(inputs)
	return es_dashboard_kb_heading(inputs)
});