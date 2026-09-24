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

const en_xa2_demo_topic_select_mode = /** @type {(inputs: Demo_Topic_Select_ModeInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèlèct mòdè ••••⟧`)
};

/**
* | output |
* | --- |
* | "Select mode" |
*
* @param {Demo_Topic_Select_ModeInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_topic_select_mode = /** @type {((inputs?: Demo_Topic_Select_ModeInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Topic_Select_ModeInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_topic_select_mode(inputs)
	if (locale === "en-XA") return en_xa2_demo_topic_select_mode(inputs)
	return en_demo_topic_select_mode(inputs)
});