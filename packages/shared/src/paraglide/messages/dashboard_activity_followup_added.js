/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dashboard_Activity_Followup_AddedInputs */

const en_dashboard_activity_followup_added = /** @type {(inputs: Dashboard_Activity_Followup_AddedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`New message`)
};

const es_dashboard_activity_followup_added = /** @type {(inputs: Dashboard_Activity_Followup_AddedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mensaje nuevo`)
};

/**
* | output |
* | --- |
* | "New message" |
*
* @param {Dashboard_Activity_Followup_AddedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const dashboard_activity_followup_added = /** @type {((inputs?: Dashboard_Activity_Followup_AddedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Activity_Followup_AddedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_dashboard_activity_followup_added(inputs)
	return es_dashboard_activity_followup_added(inputs)
});