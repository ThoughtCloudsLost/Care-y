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

/**
* | output |
* | --- |
* | "Link simulator to handbook" |
*
* @param {Demo_More_Link_UnlinkedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_more_link_unlinked = /** @type {((inputs?: Demo_More_Link_UnlinkedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_More_Link_UnlinkedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_more_link_unlinked(inputs)
	return es_demo_more_link_unlinked(inputs)
});