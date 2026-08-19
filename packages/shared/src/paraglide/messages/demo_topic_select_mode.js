/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Topic_Select_ModeInputs */

const en_demo_topic_select_mode = /** @type {(inputs: Demo_Topic_Select_ModeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Select mode`)
};

const es_demo_topic_select_mode = /** @type {(inputs: Demo_Topic_Select_ModeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Modo selección`)
};

/**
* | output |
* | --- |
* | "Select mode" |
*
* @param {Demo_Topic_Select_ModeInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_topic_select_mode = /** @type {((inputs?: Demo_Topic_Select_ModeInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Topic_Select_ModeInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_topic_select_mode(inputs)
	return es_demo_topic_select_mode(inputs)
});