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

const en_xa2_dashboard_section_count_of = /** @type {(inputs: Dashboard_Section_Count_OfInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.shown} òf  ••${i?.total}⟧`)
};

/**
* | output |
* | --- |
* | "{shown} of {total}" |
*
* @param {Dashboard_Section_Count_OfInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_section_count_of = /** @type {((inputs: Dashboard_Section_Count_OfInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Section_Count_OfInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_section_count_of(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_section_count_of(inputs)
	return en_dashboard_section_count_of(inputs)
});