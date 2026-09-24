/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Send_Rate_LimitedInputs */

const en_portal_send_rate_limited = /** @type {(inputs: Portal_Send_Rate_LimitedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your message did not send. Your words are back in the box. Too many messages went out in a short time; waiting a little, or a reply from your support team, clears the pause.`)
};

const es_portal_send_rate_limited = /** @type {(inputs: Portal_Send_Rate_LimitedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tu mensaje no se envió. Tus palabras están de vuelta en el campo de texto. Se enviaron demasiados mensajes en poco tiempo; esperar un poco, o una respuesta de tu equipo de apoyo, quita la pausa.`)
};

const en_xa2_portal_send_rate_limited = /** @type {(inputs: Portal_Send_Rate_LimitedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòùr mèssàgè dìd nòt sènd. Yòùr wòrds àrè bàck ìn thè bòx. Tòò màny mèssàgès wènt òùt ìn à shòrt tìmè; wàìtìng à lìttlè, òr à rèply fròm yòùr sùppòrt tèàm, clèàrs thè pàùsè. ••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Your message did not send. Your words are back in the box. Too many messages went out in a short time; waiting a little, or a reply from your support team, c..." |
*
* @param {Portal_Send_Rate_LimitedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_send_rate_limited = /** @type {((inputs?: Portal_Send_Rate_LimitedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Send_Rate_LimitedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_send_rate_limited(inputs)
	if (locale === "en-XA") return en_xa2_portal_send_rate_limited(inputs)
	return en_portal_send_rate_limited(inputs)
});