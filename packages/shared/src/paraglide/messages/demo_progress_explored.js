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

const en_xa2_demo_progress_explored = /** @type {(inputs: Demo_Progress_ExploredInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.seen} òf  ••${i?.total} fèàtùrès èxplòrèd ••••••⟧`)
};

/**
* | output |
* | --- |
* | "{seen} of {total} features explored" |
*
* @param {Demo_Progress_ExploredInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_progress_explored = /** @type {((inputs: Demo_Progress_ExploredInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Progress_ExploredInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_progress_explored(inputs)
	if (locale === "en-XA") return en_xa2_demo_progress_explored(inputs)
	return en_demo_progress_explored(inputs)
});