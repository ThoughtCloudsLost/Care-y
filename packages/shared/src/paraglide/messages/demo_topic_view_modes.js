/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Topic_View_ModesInputs */

const en_demo_topic_view_modes = /** @type {(inputs: Demo_Topic_View_ModesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`View modes`)
};

const es_demo_topic_view_modes = /** @type {(inputs: Demo_Topic_View_ModesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Modos de vista`)
};

const en_xa2_demo_topic_view_modes = /** @type {(inputs: Demo_Topic_View_ModesInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vìèw mòdès •••⟧`)
};

/**
* | output |
* | --- |
* | "View modes" |
*
* @param {Demo_Topic_View_ModesInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_topic_view_modes = /** @type {((inputs?: Demo_Topic_View_ModesInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Topic_View_ModesInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_topic_view_modes(inputs)
	if (locale === "en-XA") return en_xa2_demo_topic_view_modes(inputs)
	return en_demo_topic_view_modes(inputs)
});