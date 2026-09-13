/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Notif_Reset_All_ActionInputs */

const en_notif_reset_all_action = /** @type {(inputs: Notif_Reset_All_ActionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reset`)
};

const es_notif_reset_all_action = /** @type {(inputs: Notif_Reset_All_ActionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Restablecer`)
};

/**
* | output |
* | --- |
* | "Reset" |
*
* @param {Notif_Reset_All_ActionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_reset_all_action = /** @type {((inputs?: Notif_Reset_All_ActionInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Reset_All_ActionInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_notif_reset_all_action(inputs)
	return es_notif_reset_all_action(inputs)
});