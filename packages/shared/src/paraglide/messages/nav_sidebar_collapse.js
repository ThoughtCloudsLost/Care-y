/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Nav_Sidebar_CollapseInputs */

const en_nav_sidebar_collapse = /** @type {(inputs: Nav_Sidebar_CollapseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Collapse sidebar`)
};

const es_nav_sidebar_collapse = /** @type {(inputs: Nav_Sidebar_CollapseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Contraer barra lateral`)
};

/**
* | output |
* | --- |
* | "Collapse sidebar" |
*
* @param {Nav_Sidebar_CollapseInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const nav_sidebar_collapse = /** @type {((inputs?: Nav_Sidebar_CollapseInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Nav_Sidebar_CollapseInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_nav_sidebar_collapse(inputs)
	return es_nav_sidebar_collapse(inputs)
});