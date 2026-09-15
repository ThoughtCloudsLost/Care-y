/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Settings_Consultant_Phone_BodyInputs */

const en_demo_narrative_settings_consultant_phone_body = /** @type {(inputs: Demo_Narrative_Settings_Consultant_Phone_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A user who takes calls from a personal phone can register it through a three step verification flow that confirms the number before activating it.
**Removing.** Removing a verified number reverts the user to call handling through the browser softphone only, and the change takes effect immediately.
**Encryption.** The consultant phone number is sealed to the organization's public key so the server cannot read it at rest. When the user opts into SMS notification pings, a second copy is stored under a server readable operational key so the server can send those pings without a browser present, and disabling pings deletes that second copy.`)
};

const es_demo_narrative_settings_consultant_phone_body = /** @type {(inputs: Demo_Narrative_Settings_Consultant_Phone_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un usuario que atiende llamadas desde un teléfono personal puede registrarlo a través de un flujo de verificación de tres pasos que confirma el número antes de activarlo.
**Eliminar.** Eliminar un número verificado revierte al usuario al manejo de llamadas solo a través del softphone del navegador, y el cambio surte efecto inmediatamente.
**Cifrado.** El número de teléfono de consultor se sella con la clave pública de la organización para que el servidor no pueda leerlo en reposo. Cuando el usuario activa los avisos por SMS, se almacena una segunda copia con una clave operativa legible por el servidor para que pueda enviar esos avisos sin necesidad de un navegador, y desactivar los avisos elimina esa segunda copia.`)
};

/**
* | output |
* | --- |
* | "A user who takes calls from a personal phone can register it through a three step verification flow that confirms the number before activating it. **Removing..." |
*
* @param {Demo_Narrative_Settings_Consultant_Phone_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_consultant_phone_body = /** @type {((inputs?: Demo_Narrative_Settings_Consultant_Phone_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Settings_Consultant_Phone_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_settings_consultant_phone_body(inputs)
	return en_demo_narrative_settings_consultant_phone_body(inputs)
});