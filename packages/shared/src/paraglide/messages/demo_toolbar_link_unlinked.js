/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Toolbar_Link_UnlinkedInputs */

const en_demo_toolbar_link_unlinked = /** @type {(inputs: Demo_Toolbar_Link_UnlinkedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Simulator and handbook are unlinked (click to relink)`)
};

const es_demo_toolbar_link_unlinked = /** @type {(inputs: Demo_Toolbar_Link_UnlinkedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Simulador y manual desvinculados (clic para vincular)`)
};

const en_xa2_demo_toolbar_link_unlinked = /** @type {(inputs: Demo_Toolbar_Link_UnlinkedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sìmùlàtòr ànd hàndbòòk àrè ùnlìnkèd (clìck tò rèlìnk) ••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Simulator and handbook are unlinked (click to relink)" |
*
* @param {Demo_Toolbar_Link_UnlinkedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_toolbar_link_unlinked = /** @type {((inputs?: Demo_Toolbar_Link_UnlinkedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Toolbar_Link_UnlinkedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_toolbar_link_unlinked(inputs)
	if (locale === "en-XA") return en_xa2_demo_toolbar_link_unlinked(inputs)
	return en_demo_toolbar_link_unlinked(inputs)
});