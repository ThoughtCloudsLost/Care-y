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

const en_xa2_library_action_move = /** @type {(inputs: Library_Action_MoveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mòvè ••⟧`)
};

/**
* | output |
* | --- |
* | "Move" |
*
* @param {Library_Action_MoveInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_action_move = /** @type {((inputs?: Library_Action_MoveInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Action_MoveInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_action_move(inputs)
	if (locale === "en-XA") return en_xa2_library_action_move(inputs)
	return en_library_action_move(inputs)
});