/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Consultant_Phone_Sms_Pings_ExplainerInputs */

const en_consultant_phone_sms_pings_explainer = /** @type {(inputs: Consultant_Phone_Sms_Pings_ExplainerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Turning this on stores your number so the server can text you when activity happens. If you leave it off, SMS pings will arrive as email instead.`)
};

const es_consultant_phone_sms_pings_explainer = /** @type {(inputs: Consultant_Phone_Sms_Pings_ExplainerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Activar esto almacena tu numero para que el servidor pueda enviarte mensajes cuando haya actividad. Si lo dejas desactivado, las notificaciones SMS llegaran como correo electronico.`)
};

/**
* | output |
* | --- |
* | "Turning this on stores your number so the server can text you when activity happens. If you leave it off, SMS pings will arrive as email instead." |
*
* @param {Consultant_Phone_Sms_Pings_ExplainerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const consultant_phone_sms_pings_explainer = /** @type {((inputs?: Consultant_Phone_Sms_Pings_ExplainerInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Consultant_Phone_Sms_Pings_ExplainerInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_consultant_phone_sms_pings_explainer(inputs)
	return es_consultant_phone_sms_pings_explainer(inputs)
});