/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Quick_Exit_LabelInputs */

const en_portal_quick_exit_label = /** @type {(inputs: Portal_Quick_Exit_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Leave this page`)
};

const es_portal_quick_exit_label = /** @type {(inputs: Portal_Quick_Exit_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Salir de esta página`)
};

/**
* | output |
* | --- |
* | "Leave this page" |
*
* @param {Portal_Quick_Exit_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_quick_exit_label = /** @type {((inputs?: Portal_Quick_Exit_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Quick_Exit_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_portal_quick_exit_label(inputs)
	return es_portal_quick_exit_label(inputs)
});