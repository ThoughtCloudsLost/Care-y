/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dashboard_Apply_To_AllInputs */

const en_dashboard_apply_to_all = /** @type {(inputs: Dashboard_Apply_To_AllInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Apply to all`)
};

const es_dashboard_apply_to_all = /** @type {(inputs: Dashboard_Apply_To_AllInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Aplicar a todas`)
};

const en_xa2_dashboard_apply_to_all = /** @type {(inputs: Dashboard_Apply_To_AllInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àpply tò àll ••••⟧`)
};

/**
* | output |
* | --- |
* | "Apply to all" |
*
* @param {Dashboard_Apply_To_AllInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_apply_to_all = /** @type {((inputs?: Dashboard_Apply_To_AllInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Apply_To_AllInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_apply_to_all(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_apply_to_all(inputs)
	return en_dashboard_apply_to_all(inputs)
});