/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Consultant_Phone_Pings_DisabledInputs */

const en_consultant_phone_pings_disabled = /** @type {(inputs: Consultant_Phone_Pings_DisabledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`SMS pings disabled`)
};

const es_consultant_phone_pings_disabled = /** @type {(inputs: Consultant_Phone_Pings_DisabledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Notificaciones SMS desactivadas`)
};

/**
* | output |
* | --- |
* | "SMS pings disabled" |
*
* @param {Consultant_Phone_Pings_DisabledInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_pings_disabled = /** @type {((inputs?: Consultant_Phone_Pings_DisabledInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_Pings_DisabledInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_consultant_phone_pings_disabled(inputs)
	return es_consultant_phone_pings_disabled(inputs)
});