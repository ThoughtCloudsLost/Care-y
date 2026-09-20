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

const en_xa2_thread_jump_to_latest = /** @type {(inputs: Thread_Jump_To_LatestInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Jùmp tò làtèst •••••⟧`)
};

/**
* | output |
* | --- |
* | "Jump to latest" |
*
* @param {Thread_Jump_To_LatestInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const thread_jump_to_latest = /** @type {((inputs?: Thread_Jump_To_LatestInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Thread_Jump_To_LatestInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_thread_jump_to_latest(inputs)
	if (locale === "en-XA") return en_xa2_thread_jump_to_latest(inputs)
	return en_thread_jump_to_latest(inputs)
});