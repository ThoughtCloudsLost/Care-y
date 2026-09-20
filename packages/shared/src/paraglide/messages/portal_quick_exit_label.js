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

const en_xa2_portal_quick_exit_label = /** @type {(inputs: Portal_Quick_Exit_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Lèàvè thìs pàgè •••••⟧`)
};

/**
* | output |
* | --- |
* | "Leave this page" |
*
* @param {Portal_Quick_Exit_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_quick_exit_label = /** @type {((inputs?: Portal_Quick_Exit_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Quick_Exit_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_quick_exit_label(inputs)
	if (locale === "en-XA") return en_xa2_portal_quick_exit_label(inputs)
	return en_portal_quick_exit_label(inputs)
});