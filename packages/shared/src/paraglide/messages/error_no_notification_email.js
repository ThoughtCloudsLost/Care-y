/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_No_Notification_EmailInputs */

const en_error_no_notification_email = /** @type {(inputs: Error_No_Notification_EmailInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No notification email configured. Set an email address in your profile first.`)
};

const es_error_no_notification_email = /** @type {(inputs: Error_No_Notification_EmailInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No hay correo de notificación configurado. Configura una dirección de correo en tu perfil primero.`)
};

const en_xa2_error_no_notification_email = /** @type {(inputs: Error_No_Notification_EmailInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nò nòtìfìcàtìòn èmàìl cònfìgùrèd. Sèt àn èmàìl àddrèss ìn yòùr pròfìlè fìrst. ••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "No notification email configured. Set an email address in your profile first." |
*
* @param {Error_No_Notification_EmailInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_no_notification_email = /** @type {((inputs?: Error_No_Notification_EmailInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_No_Notification_EmailInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_no_notification_email(inputs)
	if (locale === "en-XA") return en_xa2_error_no_notification_email(inputs)
	return en_error_no_notification_email(inputs)
});