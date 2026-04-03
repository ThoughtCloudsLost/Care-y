/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown> }} Dashboard_See_AllInputs */

const en_dashboard_see_all = /** @type {(inputs: Dashboard_See_AllInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`See all (${i?.count})`)
};

const es_dashboard_see_all = /** @type {(inputs: Dashboard_See_AllInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Ver todos (${i?.count})`)
};

/**
* | output |
* | --- |
* | "See all ({count})" |
*
* @param {Dashboard_See_AllInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_see_all = /** @type {((inputs: Dashboard_See_AllInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_See_AllInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_dashboard_see_all(inputs)
	return es_dashboard_see_all(inputs)
});