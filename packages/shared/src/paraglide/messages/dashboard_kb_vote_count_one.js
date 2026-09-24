/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Dashboard_Kb_Vote_Count_OneInputs */

const en_dashboard_kb_vote_count_one = /** @type {(inputs: Dashboard_Kb_Vote_Count_OneInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} vote`)
};

const es_dashboard_kb_vote_count_one = /** @type {(inputs: Dashboard_Kb_Vote_Count_OneInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} voto`)
};

const en_xa2_dashboard_kb_vote_count_one = /** @type {(inputs: Dashboard_Kb_Vote_Count_OneInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.count} vòtè ••⟧`)
};

/**
* | output |
* | --- |
* | "{count} vote" |
*
* @param {Dashboard_Kb_Vote_Count_OneInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_kb_vote_count_one = /** @type {((inputs: Dashboard_Kb_Vote_Count_OneInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Kb_Vote_Count_OneInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_kb_vote_count_one(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_kb_vote_count_one(inputs)
	return en_dashboard_kb_vote_count_one(inputs)
});