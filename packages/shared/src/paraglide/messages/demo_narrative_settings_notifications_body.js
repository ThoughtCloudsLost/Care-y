/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Settings_Notifications_BodyInputs */

const en_demo_narrative_settings_notifications_body = /** @type {(inputs: Demo_Narrative_Settings_Notifications_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The notification preferences let the user control which events produce notifications and through which channels, with each combination toggled independently and changes taking effect immediately without affecting other users.
**Queue overrides.** A collapsible section per queue lets the user override the global setting for specific queues, and a queue override takes priority over the matching global preference.
**Reset.** A reset button deletes all custom preferences after a confirmation dialog, which returns every notification to its enabled default.
**Defaults.** New users have no stored preferences, so every notification starts enabled until they change it.`)
};

const es_demo_narrative_settings_notifications_body = /** @type {(inputs: Demo_Narrative_Settings_Notifications_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las preferencias de notificaciones permiten al usuario controlar qué eventos producen notificaciones y a través de qué canales, con cada combinación activable de forma independiente y los cambios surtiendo efecto inmediatamente sin afectar a otros usuarios.
**Anulaciones por cola.** Una sección plegable por cola permite al usuario anular la configuración global para colas específicas, y una anulación de cola tiene prioridad sobre la preferencia global correspondiente.
**Restablecer.** Un botón de restablecer elimina todas las preferencias personalizadas tras un diálogo de confirmación, lo que devuelve cada notificación a su estado habilitado por defecto.
**Valores predeterminados.** Los usuarios nuevos no tienen preferencias almacenadas, así que todas las notificaciones comienzan habilitadas hasta que las modifiquen.`)
};

/**
* | output |
* | --- |
* | "The notification preferences let the user control which events produce notifications and through which channels, with each combination toggled independently ..." |
*
* @param {Demo_Narrative_Settings_Notifications_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_settings_notifications_body = /** @type {((inputs?: Demo_Narrative_Settings_Notifications_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Settings_Notifications_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_settings_notifications_body(inputs)
	return en_demo_narrative_settings_notifications_body(inputs)
});