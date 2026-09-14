/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Dashboard_Kb_Vote_Count_OtherInputs */

const en_dashboard_kb_vote_count_other = /** @type {(inputs: Dashboard_Kb_Vote_Count_OtherInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} votes`)
};

const es_dashboard_kb_vote_count_other = /** @type {(inputs: Dashboard_Kb_Vote_Count_OtherInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} votos`)
};

/**
* | output |
* | --- |
* | "{count} votes" |
*
* @param {Dashboard_Kb_Vote_Count_OtherInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_kb_vote_count_other = /** @type {((inputs: Dashboard_Kb_Vote_Count_OtherInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Kb_Vote_Count_OtherInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_kb_vote_count_other(inputs)
	return en_dashboard_kb_vote_count_other(inputs)
});