/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Consultant_Phone_Remove_ActionInputs */

const en_consultant_phone_remove_action = /** @type {(inputs: Consultant_Phone_Remove_ActionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Remove`)
};

const es_consultant_phone_remove_action = /** @type {(inputs: Consultant_Phone_Remove_ActionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Eliminar`)
};

/**
* | output |
* | --- |
* | "Remove" |
*
* @param {Consultant_Phone_Remove_ActionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_remove_action = /** @type {((inputs?: Consultant_Phone_Remove_ActionInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_Remove_ActionInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_consultant_phone_remove_action(inputs)
	return es_consultant_phone_remove_action(inputs)
});