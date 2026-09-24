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

const en_xa2_nav_sidebar_label = /** @type {(inputs: Nav_Sidebar_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sìdèbàr nàvìgàtìòn ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Sidebar navigation" |
*
* @param {Nav_Sidebar_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const nav_sidebar_label = /** @type {((inputs?: Nav_Sidebar_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Nav_Sidebar_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_nav_sidebar_label(inputs)
	if (locale === "en-XA") return en_xa2_nav_sidebar_label(inputs)
	return en_nav_sidebar_label(inputs)
});