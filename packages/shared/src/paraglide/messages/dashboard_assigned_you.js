/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dashboard_Assigned_YouInputs */

const en_dashboard_assigned_you = /** @type {(inputs: Dashboard_Assigned_YouInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`You`)
};

const es_dashboard_assigned_you = /** @type {(inputs: Dashboard_Assigned_YouInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tu`)
};

/**
* | output |
* | --- |
* | "You" |
*
* @param {Dashboard_Assigned_YouInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_assigned_you = /** @type {((inputs?: Dashboard_Assigned_YouInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Assigned_YouInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_dashboard_assigned_you(inputs)
	return es_dashboard_assigned_you(inputs)
});