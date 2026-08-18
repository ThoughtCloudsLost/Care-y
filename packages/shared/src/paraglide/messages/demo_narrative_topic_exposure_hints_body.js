/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Exposure_Hints_BodyInputs */

const en_demo_narrative_topic_exposure_hints_body = /** @type {(inputs: Demo_Narrative_Topic_Exposure_Hints_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`When a volunteer initiates an SMS reply or a phone call from a ticket, a brief notice appears reminding them that the channel is not encrypted.
**SMS warning.** "SMS is not encrypted. Your phone provider can read it. Keep sensitive details in the encrypted chat."
**Call warning.** "This call routes through your phone provider. They can hear the call. Keep sensitive details in the encrypted chat."
**Frequency.** Each warning appears once per session. After the volunteer dismisses it, the same warning does not appear again until the next login. The warnings are informational and do not block the action.`)
};

const es_demo_narrative_topic_exposure_hints_body = /** @type {(inputs: Demo_Narrative_Topic_Exposure_Hints_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cuando un voluntario inicia una respuesta por SMS o una llamada telefonica desde un ticket, aparece un breve aviso recordandole que el canal no esta cifrado.
**Aviso de SMS.** "El SMS no esta cifrado. Tu proveedor de telefonia puede leerlo. Mantén los detalles sensibles en el chat cifrado."
**Aviso de llamada.** "Esta llamada pasa por tu proveedor de telefonia. Pueden escuchar la llamada. Mantén los detalles sensibles en el chat cifrado."
**Frecuencia.** Cada aviso aparece una vez por sesion. Despues de que el voluntario lo descarta, el mismo aviso no aparece de nuevo hasta el proximo inicio de sesion. Los avisos son informativos y no bloquean la accion.`)
};

/**
* | output |
* | --- |
* | "When a volunteer initiates an SMS reply or a phone call from a ticket, a brief notice appears reminding them that the channel is not encrypted. **SMS warning..." |
*
* @param {Demo_Narrative_Topic_Exposure_Hints_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_exposure_hints_body = /** @type {((inputs?: Demo_Narrative_Topic_Exposure_Hints_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Exposure_Hints_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_exposure_hints_body(inputs)
	return es_demo_narrative_topic_exposure_hints_body(inputs)
});