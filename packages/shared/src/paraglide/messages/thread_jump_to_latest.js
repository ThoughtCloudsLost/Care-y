/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Thread_Jump_To_LatestInputs */

const en_thread_jump_to_latest = /** @type {(inputs: Thread_Jump_To_LatestInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Jump to latest`)
};

const es_thread_jump_to_latest = /** @type {(inputs: Thread_Jump_To_LatestInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ir a lo más reciente`)
};

/**
* | output |
* | --- |
* | "Jump to latest" |
*
* @param {Thread_Jump_To_LatestInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const thread_jump_to_latest = /** @type {((inputs?: Thread_Jump_To_LatestInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Thread_Jump_To_LatestInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_thread_jump_to_latest(inputs)
	return es_thread_jump_to_latest(inputs)
});