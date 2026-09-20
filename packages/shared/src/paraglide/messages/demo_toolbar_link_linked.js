/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Toolbar_Link_LinkedInputs */

const en_demo_toolbar_link_linked = /** @type {(inputs: Demo_Toolbar_Link_LinkedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Simulator and handbook are linked (click to unlink)`)
};

const es_demo_toolbar_link_linked = /** @type {(inputs: Demo_Toolbar_Link_LinkedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Simulador y manual vinculados (clic para desvincular)`)
};

const en_xa2_demo_toolbar_link_linked = /** @type {(inputs: Demo_Toolbar_Link_LinkedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sìmùlàtòr ànd hàndbòòk àrè lìnkèd (clìck tò ùnlìnk) ••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Simulator and handbook are linked (click to unlink)" |
*
* @param {Demo_Toolbar_Link_LinkedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_toolbar_link_linked = /** @type {((inputs?: Demo_Toolbar_Link_LinkedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Toolbar_Link_LinkedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_toolbar_link_linked(inputs)
	if (locale === "en-XA") return en_xa2_demo_toolbar_link_linked(inputs)
	return en_demo_toolbar_link_linked(inputs)
});