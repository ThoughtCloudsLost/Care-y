/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ seen: NonNullable<unknown>, total: NonNullable<unknown> }} Demo_Progress_ExploredInputs */

const en_demo_progress_explored = /** @type {(inputs: Demo_Progress_ExploredInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.seen} of ${i?.total} features explored`)
};

const es_demo_progress_explored = /** @type {(inputs: Demo_Progress_ExploredInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.seen} de ${i?.total} funciones exploradas`)
};

/**
* | output |
* | --- |
* | "{seen} of {total} features explored" |
*
* @param {Demo_Progress_ExploredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_progress_explored = /** @type {((inputs: Demo_Progress_ExploredInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Progress_ExploredInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_progress_explored(inputs)
	return es_demo_progress_explored(inputs)
});