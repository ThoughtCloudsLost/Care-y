/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Notif_Reset_All_ConfirmInputs */

const en_notif_reset_all_confirm = /** @type {(inputs: Notif_Reset_All_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`All your notification preferences will revert to the defaults. This cannot be undone.`)
};

const es_notif_reset_all_confirm = /** @type {(inputs: Notif_Reset_All_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Todas tus preferencias de notificación volveran a los valores predeterminados. Esto no se puede deshacer.`)
};

const en_xa2_notif_reset_all_confirm = /** @type {(inputs: Notif_Reset_All_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àll yòùr nòtìfìcàtìòn prèfèrèncès wìll rèvèrt tò thè dèfàùlts. Thìs cànnòt bè ùndònè. ••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "All your notification preferences will revert to the defaults. This cannot be undone." |
*
* @param {Notif_Reset_All_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const notif_reset_all_confirm = /** @type {((inputs?: Notif_Reset_All_ConfirmInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Notif_Reset_All_ConfirmInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_notif_reset_all_confirm(inputs)
	if (locale === "en-XA") return en_xa2_notif_reset_all_confirm(inputs)
	return en_notif_reset_all_confirm(inputs)
});