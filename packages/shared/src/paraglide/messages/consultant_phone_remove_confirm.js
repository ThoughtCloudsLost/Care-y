/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Consultant_Phone_Remove_ConfirmInputs */

const en_consultant_phone_remove_confirm = /** @type {(inputs: Consultant_Phone_Remove_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your verified phone will be removed. You will not be able to receive callback calls or SMS pings until you register and verify a new number.`)
};

const es_consultant_phone_remove_confirm = /** @type {(inputs: Consultant_Phone_Remove_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tu telefono verificado sera eliminado. No podras recibir llamadas de devolucion ni notificaciones SMS hasta que registres y verifiques un nuevo numero.`)
};

/**
* | output |
* | --- |
* | "Your verified phone will be removed. You will not be able to receive callback calls or SMS pings until you register and verify a new number." |
*
* @param {Consultant_Phone_Remove_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_remove_confirm = /** @type {((inputs?: Consultant_Phone_Remove_ConfirmInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_Remove_ConfirmInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_consultant_phone_remove_confirm(inputs)
	return es_consultant_phone_remove_confirm(inputs)
});