/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Consultant_Phone_Remove_TitleInputs */

const en_consultant_phone_remove_title = /** @type {(inputs: Consultant_Phone_Remove_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Remove your phone?`)
};

const es_consultant_phone_remove_title = /** @type {(inputs: Consultant_Phone_Remove_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`¿Eliminar tu teléfono?`)
};

const en_xa2_consultant_phone_remove_title = /** @type {(inputs: Consultant_Phone_Remove_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèmòvè yòùr phònè? ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Remove your phone?" |
*
* @param {Consultant_Phone_Remove_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_remove_title = /** @type {((inputs?: Consultant_Phone_Remove_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_Remove_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_consultant_phone_remove_title(inputs)
	if (locale === "en-XA") return en_xa2_consultant_phone_remove_title(inputs)
	return en_consultant_phone_remove_title(inputs)
});