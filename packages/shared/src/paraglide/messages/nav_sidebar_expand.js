/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Nav_Sidebar_ExpandInputs */

const en_nav_sidebar_expand = /** @type {(inputs: Nav_Sidebar_ExpandInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Expand sidebar`)
};

const es_nav_sidebar_expand = /** @type {(inputs: Nav_Sidebar_ExpandInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Expandir barra lateral`)
};

const en_xa2_nav_sidebar_expand = /** @type {(inputs: Nav_Sidebar_ExpandInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èxpànd sìdèbàr •••••⟧`)
};

/**
* | output |
* | --- |
* | "Expand sidebar" |
*
* @param {Nav_Sidebar_ExpandInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const nav_sidebar_expand = /** @type {((inputs?: Nav_Sidebar_ExpandInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Nav_Sidebar_ExpandInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_nav_sidebar_expand(inputs)
	if (locale === "en-XA") return en_xa2_nav_sidebar_expand(inputs)
	return en_nav_sidebar_expand(inputs)
});