/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Logs_Filter_ActorInputs */

const en_logs_filter_actor = /** @type {(inputs: Logs_Filter_ActorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Actor`)
};

const es_logs_filter_actor = /** @type {(inputs: Logs_Filter_ActorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Actor`)
};

const en_xa2_logs_filter_actor = /** @type {(inputs: Logs_Filter_ActorInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àctòr ••⟧`)
};

/**
* | output |
* | --- |
* | "Actor" |
*
* @param {Logs_Filter_ActorInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const logs_filter_actor = /** @type {((inputs?: Logs_Filter_ActorInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Logs_Filter_ActorInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_logs_filter_actor(inputs)
	if (locale === "en-XA") return en_xa2_logs_filter_actor(inputs)
	return en_logs_filter_actor(inputs)
});