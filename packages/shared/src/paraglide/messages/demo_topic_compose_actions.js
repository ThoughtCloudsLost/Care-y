/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Topic_Compose_ActionsInputs */

const en_demo_topic_compose_actions = /** @type {(inputs: Demo_Topic_Compose_ActionsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Compose actions`)
};

const es_demo_topic_compose_actions = /** @type {(inputs: Demo_Topic_Compose_ActionsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Acciones de composición`)
};

/**
* | output |
* | --- |
* | "Compose actions" |
*
* @param {Demo_Topic_Compose_ActionsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_topic_compose_actions = /** @type {((inputs?: Demo_Topic_Compose_ActionsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Topic_Compose_ActionsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_topic_compose_actions(inputs)
	return es_demo_topic_compose_actions(inputs)
});