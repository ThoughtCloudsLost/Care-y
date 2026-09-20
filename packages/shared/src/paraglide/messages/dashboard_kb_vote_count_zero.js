/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dashboard_Kb_Vote_Count_ZeroInputs */

const en_dashboard_kb_vote_count_zero = /** @type {(inputs: Dashboard_Kb_Vote_Count_ZeroInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`no votes`)
};

const es_dashboard_kb_vote_count_zero = /** @type {(inputs: Dashboard_Kb_Vote_Count_ZeroInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`sin votos`)
};

const en_xa2_dashboard_kb_vote_count_zero = /** @type {(inputs: Dashboard_Kb_Vote_Count_ZeroInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦nò vòtès •••⟧`)
};

/**
* | output |
* | --- |
* | "no votes" |
*
* @param {Dashboard_Kb_Vote_Count_ZeroInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_kb_vote_count_zero = /** @type {((inputs?: Dashboard_Kb_Vote_Count_ZeroInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Kb_Vote_Count_ZeroInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_kb_vote_count_zero(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_kb_vote_count_zero(inputs)
	return en_dashboard_kb_vote_count_zero(inputs)
});