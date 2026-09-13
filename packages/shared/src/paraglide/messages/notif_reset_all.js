/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Notif_Reset_AllInputs */

const en_notif_reset_all = /** @type {(inputs: Notif_Reset_AllInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reset all to defaults`)
};

const es_notif_reset_all = /** @type {(inputs: Notif_Reset_AllInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Restablecer todo`)
};

/**
* | output |
* | --- |
* | "Reset all to defaults" |
*
* @param {Notif_Reset_AllInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_reset_all = /** @type {((inputs?: Notif_Reset_AllInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Reset_AllInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_notif_reset_all(inputs)
	return es_notif_reset_all(inputs)
});