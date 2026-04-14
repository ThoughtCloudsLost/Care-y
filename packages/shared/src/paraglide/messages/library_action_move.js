/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Action_MoveInputs */

const en_library_action_move = /** @type {(inputs: Library_Action_MoveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Move`)
};

const es_library_action_move = /** @type {(inputs: Library_Action_MoveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mover`)
};

/**
* | output |
* | --- |
* | "Move" |
*
* @param {Library_Action_MoveInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const library_action_move = /** @type {((inputs?: Library_Action_MoveInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Action_MoveInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_library_action_move(inputs)
	return es_library_action_move(inputs)
});