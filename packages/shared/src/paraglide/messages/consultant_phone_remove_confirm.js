/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Consultant_Phone_Remove_ConfirmInputs */

const en_consultant_phone_remove_confirm = /** @type {(inputs: Consultant_Phone_Remove_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your verified phone will be removed. You will not be able to receive callback calls or SMS pings until you register and verify a new number.`)
};

const es_consultant_phone_remove_confirm = /** @type {(inputs: Consultant_Phone_Remove_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tu teléfono verificado será eliminado. No podras recibir llamadas de devolución ni notificaciones SMS hasta que registres y verifiques un nuevo número.`)
};

const en_xa2_consultant_phone_remove_confirm = /** @type {(inputs: Consultant_Phone_Remove_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòùr vèrìfìèd phònè wìll bè rèmòvèd. Yòù wìll nòt bè àblè tò rècèìvè càllbàck càlls òr SMS pìngs ùntìl yòù règìstèr ànd vèrìfy à nèw nùmbèr. ••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Your verified phone will be removed. You will not be able to receive callback calls or SMS pings until you register and verify a new number." |
*
* @param {Consultant_Phone_Remove_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_remove_confirm = /** @type {((inputs?: Consultant_Phone_Remove_ConfirmInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_Remove_ConfirmInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_consultant_phone_remove_confirm(inputs)
	if (locale === "en-XA") return en_xa2_consultant_phone_remove_confirm(inputs)
	return en_consultant_phone_remove_confirm(inputs)
});