/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ shown: NonNullable<unknown>, total: NonNullable<unknown> }} Dashboard_Section_Count_OfInputs */

const en_dashboard_section_count_of = /** @type {(inputs: Dashboard_Section_Count_OfInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.shown} of ${i?.total}`)
};

const es_dashboard_section_count_of = /** @type {(inputs: Dashboard_Section_Count_OfInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.shown} de ${i?.total}`)
};

/**
* | output |
* | --- |
* | "{shown} of {total}" |
*
* @param {Dashboard_Section_Count_OfInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_section_count_of = /** @type {((inputs: Dashboard_Section_Count_OfInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Section_Count_OfInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_dashboard_section_count_of(inputs)
	return es_dashboard_section_count_of(inputs)
});