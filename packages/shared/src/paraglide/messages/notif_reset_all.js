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

const en_xa2_notif_reset_all = /** @type {(inputs: Notif_Reset_AllInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèsèt àll tò dèfàùlts •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Reset all to defaults" |
*
* @param {Notif_Reset_AllInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const notif_reset_all = /** @type {((inputs?: Notif_Reset_AllInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Reset_AllInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_notif_reset_all(inputs)
	if (locale === "en-XA") return en_xa2_notif_reset_all(inputs)
	return en_notif_reset_all(inputs)
});