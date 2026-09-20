/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Consultant_Phone_RemovedInputs */

const en_consultant_phone_removed = /** @type {(inputs: Consultant_Phone_RemovedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Phone removed`)
};

const es_consultant_phone_removed = /** @type {(inputs: Consultant_Phone_RemovedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Teléfono eliminado`)
};

const en_xa2_consultant_phone_removed = /** @type {(inputs: Consultant_Phone_RemovedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Phònè rèmòvèd ••••⟧`)
};

/**
* | output |
* | --- |
* | "Phone removed" |
*
* @param {Consultant_Phone_RemovedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_removed = /** @type {((inputs?: Consultant_Phone_RemovedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_RemovedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_consultant_phone_removed(inputs)
	if (locale === "en-XA") return en_xa2_consultant_phone_removed(inputs)
	return en_consultant_phone_removed(inputs)
});