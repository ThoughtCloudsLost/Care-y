/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Channel_Policy_BodyInputs */

const en_demo_narrative_admin_channel_policy_body = /** @type {(inputs: Demo_Narrative_Admin_Channel_Policy_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The channel policy section controls which communication channels are available to users across the organization, with five channels that each have an independent on/off toggle.
**Off hints.** When a channel is turned off, a hint appears below the toggle explaining what the change removes for users working tickets.
**Effect on users.** A disabled channel disappears from the compose actions and from any control that would use it, so a user working a ticket never sees an option the organization has turned off.
**Onboarding.** The same channel policy section appears during the organization setup flow on the communications step, so an administrator can set the initial channel availability before anyone starts working tickets.`)
};

const es_demo_narrative_admin_channel_policy_body = /** @type {(inputs: Demo_Narrative_Admin_Channel_Policy_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La sección de política de canales controla qué canales de comunicación están disponibles para los usuarios en toda la organización, con cinco canales que tienen cada uno un interruptor independiente de activar/desactivar.
**Indicaciones de desactivación.** Cuando un canal se desactiva, aparece una indicación debajo del interruptor explicando lo que el cambio elimina para los usuarios que trabajan en tickets.
**Efecto en los usuarios.** Un canal desactivado desaparece de las acciones de composición y de cualquier control que lo use, de modo que un usuario que trabaje en un ticket nunca ve una opción que la organización ha desactivado.
**Incorporación.** La misma sección de política de canales aparece durante el flujo de configuración de la organización en el paso de comunicaciones, para que un administrador pueda establecer la disponibilidad inicial de los canales antes de que nadie empiece a trabajar tickets.`)
};

/**
* | output |
* | --- |
* | "The channel policy section controls which communication channels are available to users across the organization, with five channels that each have an indepen..." |
*
* @param {Demo_Narrative_Admin_Channel_Policy_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_channel_policy_body = /** @type {((inputs?: Demo_Narrative_Admin_Channel_Policy_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Channel_Policy_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_channel_policy_body(inputs)
	return en_demo_narrative_admin_channel_policy_body(inputs)
});