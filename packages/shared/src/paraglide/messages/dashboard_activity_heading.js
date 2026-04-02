/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dashboard_Activity_HeadingInputs */

const en_dashboard_activity_heading = /** @type {(inputs: Dashboard_Activity_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Activity`)
};

const es_dashboard_activity_heading = /** @type {(inputs: Dashboard_Activity_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Actividad`)
};

/**
* | output |
* | --- |
* | "Activity" |
*
* @param {Dashboard_Activity_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_activity_heading = /** @type {((inputs?: Dashboard_Activity_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Activity_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_dashboard_activity_heading(inputs)
	return es_dashboard_activity_heading(inputs)
});