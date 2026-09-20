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

const en_xa2_dashboard_activity_heading = /** @type {(inputs: Dashboard_Activity_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àctìvìty •••⟧`)
};

/**
* | output |
* | --- |
* | "Activity" |
*
* @param {Dashboard_Activity_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_activity_heading = /** @type {((inputs?: Dashboard_Activity_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Activity_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_activity_heading(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_activity_heading(inputs)
	return en_dashboard_activity_heading(inputs)
});