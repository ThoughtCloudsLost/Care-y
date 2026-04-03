/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Dashboard_Kb_RatingInputs */

const en_dashboard_kb_rating = /** @type {(inputs: Dashboard_Kb_RatingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} votes`)
};

const es_dashboard_kb_rating = /** @type {(inputs: Dashboard_Kb_RatingInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.count} votos`)
};

/**
* | output |
* | --- |
* | "{count} votes" |
*
* @param {Dashboard_Kb_RatingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_kb_rating = /** @type {((inputs: Dashboard_Kb_RatingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Kb_RatingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_dashboard_kb_rating(inputs)
	return es_dashboard_kb_rating(inputs)
});