/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Nav_Sidebar_LabelInputs */

const en_nav_sidebar_label = /** @type {(inputs: Nav_Sidebar_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sidebar navigation`)
};

const es_nav_sidebar_label = /** @type {(inputs: Nav_Sidebar_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Navegación lateral`)
};

/**
* | output |
* | --- |
* | "Sidebar navigation" |
*
* @param {Nav_Sidebar_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const nav_sidebar_label = /** @type {((inputs?: Nav_Sidebar_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Nav_Sidebar_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_nav_sidebar_label(inputs)
	return es_nav_sidebar_label(inputs)
});