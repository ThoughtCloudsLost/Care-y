/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_More_Link_LinkedInputs */

const en_demo_more_link_linked = /** @type {(inputs: Demo_More_Link_LinkedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Unlink simulator from handbook`)
};

const es_demo_more_link_linked = /** @type {(inputs: Demo_More_Link_LinkedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Desvincular el simulador del manual`)
};

const en_xa2_demo_more_link_linked = /** @type {(inputs: Demo_More_Link_LinkedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùnlìnk sìmùlàtòr fròm hàndbòòk •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Unlink simulator from handbook" |
*
* @param {Demo_More_Link_LinkedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_more_link_linked = /** @type {((inputs?: Demo_More_Link_LinkedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_More_Link_LinkedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_more_link_linked(inputs)
	if (locale === "en-XA") return en_xa2_demo_more_link_linked(inputs)
	return en_demo_more_link_linked(inputs)
});