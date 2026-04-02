/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dashboard_Shift_YouInputs */

const en_dashboard_shift_you = /** @type {(inputs: Dashboard_Shift_YouInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`(you)`)
};

const es_dashboard_shift_you = /** @type {(inputs: Dashboard_Shift_YouInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`(tu)`)
};

/**
* | output |
* | --- |
* | "(you)" |
*
* @param {Dashboard_Shift_YouInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_shift_you = /** @type {((inputs?: Dashboard_Shift_YouInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Shift_YouInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_dashboard_shift_you(inputs)
	return es_dashboard_shift_you(inputs)
});