/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Mgr_Section_OpsInputs */

const en_mgr_section_ops = /** @type {(inputs: Mgr_Section_OpsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Operations Snapshot`)
};

const es_mgr_section_ops = /** @type {(inputs: Mgr_Section_OpsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Resumen Operativo`)
};

/**
* | output |
* | --- |
* | "Operations Snapshot" |
*
* @param {Mgr_Section_OpsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const mgr_section_ops = /** @type {((inputs?: Mgr_Section_OpsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Mgr_Section_OpsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_mgr_section_ops(inputs)
	return es_mgr_section_ops(inputs)
});