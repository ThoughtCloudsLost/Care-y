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

/**
* | output |
* | --- |
* | "Expand sidebar" |
*
* @param {Nav_Sidebar_ExpandInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const nav_sidebar_expand = /** @type {((inputs?: Nav_Sidebar_ExpandInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Nav_Sidebar_ExpandInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_nav_sidebar_expand(inputs)
	return es_nav_sidebar_expand(inputs)
});