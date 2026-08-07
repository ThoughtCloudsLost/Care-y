/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Consultant_Phone_RemoveInputs */

const en_consultant_phone_remove = /** @type {(inputs: Consultant_Phone_RemoveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Remove phone`)
};

const es_consultant_phone_remove = /** @type {(inputs: Consultant_Phone_RemoveInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Eliminar telefono`)
};

/**
* | output |
* | --- |
* | "Remove phone" |
*
* @param {Consultant_Phone_RemoveInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_remove = /** @type {((inputs?: Consultant_Phone_RemoveInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_RemoveInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_consultant_phone_remove(inputs)
	return es_consultant_phone_remove(inputs)
});