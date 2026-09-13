/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Consultant_Phone_Remove_TitleInputs */

const en_consultant_phone_remove_title = /** @type {(inputs: Consultant_Phone_Remove_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Remove your phone?`)
};

const es_consultant_phone_remove_title = /** @type {(inputs: Consultant_Phone_Remove_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`¿Eliminar tu telefono?`)
};

/**
* | output |
* | --- |
* | "Remove your phone?" |
*
* @param {Consultant_Phone_Remove_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_remove_title = /** @type {((inputs?: Consultant_Phone_Remove_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_Remove_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_consultant_phone_remove_title(inputs)
	return es_consultant_phone_remove_title(inputs)
});