/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_More_Link_UnlinkedInputs */

const en_demo_more_link_unlinked = /** @type {(inputs: Demo_More_Link_UnlinkedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Link simulator to handbook`)
};

const es_demo_more_link_unlinked = /** @type {(inputs: Demo_More_Link_UnlinkedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vincular el simulador al manual`)
};

const en_xa2_demo_more_link_unlinked = /** @type {(inputs: Demo_More_Link_UnlinkedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Lìnk sìmùlàtòr tò hàndbòòk ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Link simulator to handbook" |
*
* @param {Demo_More_Link_UnlinkedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_more_link_unlinked = /** @type {((inputs?: Demo_More_Link_UnlinkedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_More_Link_UnlinkedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_more_link_unlinked(inputs)
	if (locale === "en-XA") return en_xa2_demo_more_link_unlinked(inputs)
	return en_demo_more_link_unlinked(inputs)
});