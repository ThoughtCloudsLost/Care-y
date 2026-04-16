/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Create_New_QueueInputs */

const en_create_new_queue = /** @type {(inputs: Create_New_QueueInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`New Queue`)
};

const es_create_new_queue = /** @type {(inputs: Create_New_QueueInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nueva Cola`)
};

/**
* | output |
* | --- |
* | "New Queue" |
*
* @param {Create_New_QueueInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const create_new_queue = /** @type {((inputs?: Create_New_QueueInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Create_New_QueueInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_create_new_queue(inputs)
	return es_create_new_queue(inputs)
});