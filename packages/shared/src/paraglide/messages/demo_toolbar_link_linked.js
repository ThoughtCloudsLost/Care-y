/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Toolbar_Link_LinkedInputs */

const en_demo_toolbar_link_linked = /** @type {(inputs: Demo_Toolbar_Link_LinkedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Phone and story are linked (click to unlink)`)
};

const es_demo_toolbar_link_linked = /** @type {(inputs: Demo_Toolbar_Link_LinkedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Telefono y historia vinculados (clic para desvincular)`)
};

/**
* | output |
* | --- |
* | "Phone and story are linked (click to unlink)" |
*
* @param {Demo_Toolbar_Link_LinkedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_toolbar_link_linked = /** @type {((inputs?: Demo_Toolbar_Link_LinkedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Toolbar_Link_LinkedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_toolbar_link_linked(inputs)
	return es_demo_toolbar_link_linked(inputs)
});