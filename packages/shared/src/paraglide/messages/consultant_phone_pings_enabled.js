/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Consultant_Phone_Pings_EnabledInputs */

const en_consultant_phone_pings_enabled = /** @type {(inputs: Consultant_Phone_Pings_EnabledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`SMS pings enabled`)
};

const es_consultant_phone_pings_enabled = /** @type {(inputs: Consultant_Phone_Pings_EnabledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Notificaciones SMS activadas`)
};

/**
* | output |
* | --- |
* | "SMS pings enabled" |
*
* @param {Consultant_Phone_Pings_EnabledInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_pings_enabled = /** @type {((inputs?: Consultant_Phone_Pings_EnabledInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_Pings_EnabledInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_consultant_phone_pings_enabled(inputs)
	return es_consultant_phone_pings_enabled(inputs)
});