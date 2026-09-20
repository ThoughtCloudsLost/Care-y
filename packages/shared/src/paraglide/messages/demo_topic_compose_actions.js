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

const en_xa2_demo_topic_compose_actions = /** @type {(inputs: Demo_Topic_Compose_ActionsInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Còmpòsè àctìòns •••••⟧`)
};

/**
* | output |
* | --- |
* | "Compose actions" |
*
* @param {Demo_Topic_Compose_ActionsInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_topic_compose_actions = /** @type {((inputs?: Demo_Topic_Compose_ActionsInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Topic_Compose_ActionsInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_topic_compose_actions(inputs)
	if (locale === "en-XA") return en_xa2_demo_topic_compose_actions(inputs)
	return en_demo_topic_compose_actions(inputs)
});