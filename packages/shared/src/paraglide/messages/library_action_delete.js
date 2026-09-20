/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Library_Action_DeleteInputs */

const en_library_action_delete = /** @type {(inputs: Library_Action_DeleteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Delete`)
};

const es_library_action_delete = /** @type {(inputs: Library_Action_DeleteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Eliminar`)
};

const en_xa2_library_action_delete = /** @type {(inputs: Library_Action_DeleteInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dèlètè ••⟧`)
};

/**
* | output |
* | --- |
* | "Delete" |
*
* @param {Library_Action_DeleteInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const library_action_delete = /** @type {((inputs?: Library_Action_DeleteInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Library_Action_DeleteInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_library_action_delete(inputs)
	if (locale === "en-XA") return en_xa2_library_action_delete(inputs)
	return en_library_action_delete(inputs)
});