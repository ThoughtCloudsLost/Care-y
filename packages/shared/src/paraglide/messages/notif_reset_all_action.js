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

const en_xa2_notif_reset_all_action = /** @type {(inputs: Notif_Reset_All_ActionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèsèt ••⟧`)
};

/**
* | output |
* | --- |
* | "Reset" |
*
* @param {Notif_Reset_All_ActionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const notif_reset_all_action = /** @type {((inputs?: Notif_Reset_All_ActionInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Reset_All_ActionInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_notif_reset_all_action(inputs)
	if (locale === "en-XA") return en_xa2_notif_reset_all_action(inputs)
	return en_notif_reset_all_action(inputs)
});