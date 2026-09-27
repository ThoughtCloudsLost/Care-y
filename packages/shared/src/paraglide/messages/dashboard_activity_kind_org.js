/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dashboard_Activity_Kind_OrgInputs */

const en_dashboard_activity_kind_org = /** @type {(inputs: Dashboard_Activity_Kind_OrgInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organization changes`)
};

const es_dashboard_activity_kind_org = /** @type {(inputs: Dashboard_Activity_Kind_OrgInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambios en la organización`)
};

const en_xa2_dashboard_activity_kind_org = /** @type {(inputs: Dashboard_Activity_Kind_OrgInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òrgànìzàtìòn chàngès ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Organization changes" |
*
* @param {Dashboard_Activity_Kind_OrgInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_activity_kind_org = /** @type {((inputs?: Dashboard_Activity_Kind_OrgInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Activity_Kind_OrgInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_activity_kind_org(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_activity_kind_org(inputs)
	return en_dashboard_activity_kind_org(inputs)
});