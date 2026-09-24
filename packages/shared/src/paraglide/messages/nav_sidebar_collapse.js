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

const en_xa2_nav_sidebar_collapse = /** @type {(inputs: Nav_Sidebar_CollapseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còllàpsè sìdèbàr •••••⟧`)
};

/**
* | output |
* | --- |
* | "Collapse sidebar" |
*
* @param {Nav_Sidebar_CollapseInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const nav_sidebar_collapse = /** @type {((inputs?: Nav_Sidebar_CollapseInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Nav_Sidebar_CollapseInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_nav_sidebar_collapse(inputs)
	if (locale === "en-XA") return en_xa2_nav_sidebar_collapse(inputs)
	return en_nav_sidebar_collapse(inputs)
});