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

/**
* | output |
* | --- |
* | "View modes" |
*
* @param {Demo_Topic_View_ModesInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_topic_view_modes = /** @type {((inputs?: Demo_Topic_View_ModesInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Topic_View_ModesInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_topic_view_modes(inputs)
	return es_demo_topic_view_modes(inputs)
});