/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dashboard_Assigned_UnassignedInputs */

const en_dashboard_assigned_unassigned = /** @type {(inputs: Dashboard_Assigned_UnassignedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Unassigned`)
};

const es_dashboard_assigned_unassigned = /** @type {(inputs: Dashboard_Assigned_UnassignedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sin asignar`)
};

const en_xa2_dashboard_assigned_unassigned = /** @type {(inputs: Dashboard_Assigned_UnassignedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùnàssìgnèd •••⟧`)
};

/**
* | output |
* | --- |
* | "Unassigned" |
*
* @param {Dashboard_Assigned_UnassignedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_assigned_unassigned = /** @type {((inputs?: Dashboard_Assigned_UnassignedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Assigned_UnassignedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_assigned_unassigned(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_assigned_unassigned(inputs)
	return en_dashboard_assigned_unassigned(inputs)
});