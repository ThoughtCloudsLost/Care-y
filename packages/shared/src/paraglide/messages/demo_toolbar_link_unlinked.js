/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Toolbar_Link_UnlinkedInputs */

const en_demo_toolbar_link_unlinked = /** @type {(inputs: Demo_Toolbar_Link_UnlinkedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Phone and handbook are unlinked (click to relink)`)
};

const es_demo_toolbar_link_unlinked = /** @type {(inputs: Demo_Toolbar_Link_UnlinkedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Teléfono y manual desvinculados (clic para vincular)`)
};

/**
* | output |
* | --- |
* | "Phone and handbook are unlinked (click to relink)" |
*
* @param {Demo_Toolbar_Link_UnlinkedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_toolbar_link_unlinked = /** @type {((inputs?: Demo_Toolbar_Link_UnlinkedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Toolbar_Link_UnlinkedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_toolbar_link_unlinked(inputs)
	return es_demo_toolbar_link_unlinked(inputs)
});