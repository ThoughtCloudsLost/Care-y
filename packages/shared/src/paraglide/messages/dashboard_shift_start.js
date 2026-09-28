/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dashboard_Shift_StartInputs */

const en_dashboard_shift_start = /** @type {(inputs: Dashboard_Shift_StartInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Start shift`)
};

const es_dashboard_shift_start = /** @type {(inputs: Dashboard_Shift_StartInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Iniciar turno`)
};

const en_xa2_dashboard_shift_start = /** @type {(inputs: Dashboard_Shift_StartInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Stàrt shìft ••••⟧`)
};

/**
* | output |
* | --- |
* | "Start shift" |
*
* @param {Dashboard_Shift_StartInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_shift_start = /** @type {((inputs?: Dashboard_Shift_StartInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Shift_StartInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_shift_start(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_shift_start(inputs)
	return en_dashboard_shift_start(inputs)
});