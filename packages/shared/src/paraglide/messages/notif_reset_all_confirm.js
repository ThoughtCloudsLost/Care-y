/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Notif_Reset_All_ConfirmInputs */

const en_notif_reset_all_confirm = /** @type {(inputs: Notif_Reset_All_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`All your notification preferences will revert to the defaults. This cannot be undone.`)
};

const es_notif_reset_all_confirm = /** @type {(inputs: Notif_Reset_All_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Todas tus preferencias de notificacion volveran a los valores predeterminados. Esto no se puede deshacer.`)
};

/**
* | output |
* | --- |
* | "All your notification preferences will revert to the defaults. This cannot be undone." |
*
* @param {Notif_Reset_All_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const notif_reset_all_confirm = /** @type {((inputs?: Notif_Reset_All_ConfirmInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Reset_All_ConfirmInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_notif_reset_all_confirm(inputs)
	return es_notif_reset_all_confirm(inputs)
});