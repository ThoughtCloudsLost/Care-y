/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Channel_Policy_BodyInputs */

const en_demo_narrative_admin_channel_policy_body = /** @type {(inputs: Demo_Narrative_Admin_Channel_Policy_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The channel policy controls which communication channels are available across the organization, with five channels that each have an independent toggle.
**Effect on users.** A disabled channel disappears from compose actions and from any control that would use it, so a user working a ticket never sees an option the organization has turned off. The policy is also enforced on the server, not only in the interface, so a direct request for a disabled channel is rejected.
**Onboarding.** The channel policy also appears during the organization setup flow on the communications step, so the initial channel availability can be set before anyone starts working tickets.
**Permissions.** Changing the channel policy requires the Manage channel routing permission.`)
};

const es_demo_narrative_admin_channel_policy_body = /** @type {(inputs: Demo_Narrative_Admin_Channel_Policy_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La política de canales controla qué canales de comunicación están disponibles en toda la organización, con cinco canales que tienen cada uno un interruptor independiente.
**Efecto en la persona usuaria.** Un canal desactivado desaparece de las acciones de composición y de cualquier control que lo use, de modo que la persona usuaria que trabaje en un ticket nunca ve una opción que la organización ha desactivado. La política también se aplica en el servidor, no solo en la interfaz, de modo que una solicitud directa para un canal desactivado se rechaza.
**Incorporación.** La política de canales también aparece durante el flujo de configuración de la organización en el paso de comunicaciones, para que la disponibilidad inicial se establezca antes de que nadie empiece a trabajar tickets.
**Permisos.** Cambiar la política de canales requiere el permiso Gestionar enrutamiento de canales.`)
};

const en_xa2_demo_narrative_admin_channel_policy_body = /** @type {(inputs: Demo_Narrative_Admin_Channel_Policy_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè chànnèl pòlìcy còntròls whìch còmmùnìcàtìòn chànnèls àrè àvàìlàblè àcròss thè òrgànìzàtìòn, wìth fìvè chànnèls thàt èàch hàvè àn ìndèpèndènt tògglè.
 ••••••••••••••••••••••••••••••••••••••••••••••**Èffèct òn ùsèrs. •••••** À dìsàblèd chànnèl dìsàppèàrs fròm còmpòsè àctìòns ànd fròm àny còntròl thàt wòùld ùsè ìt, sò à ùsèr wòrkìng à tìckèt nèvèr sèès àn òptìòn thè òrgànìzàtìòn hàs tùrnèd òff. Thè pòlìcy ìs àlsò ènfòrcèd òn thè sèrvèr, nòt ònly ìn thè ìntèrfàcè, sò à dìrèct rèqùèst fòr à dìsàblèd chànnèl ìs rèjèctèd.
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Ònbòàrdìng. ••••** Thè chànnèl pòlìcy àlsò àppèàrs dùrìng thè òrgànìzàtìòn sètùp flòw òn thè còmmùnìcàtìòns stèp, sò thè ìnìtìàl chànnèl àvàìlàbìlìty càn bè sèt bèfòrè ànyònè stàrts wòrkìng tìckèts.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••**Pèrmìssìòns. ••••** Chàngìng thè chànnèl pòlìcy rèqùìrès thè Mànàgè chànnèl ròùtìng pèrmìssìòn. •••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The channel policy controls which communication channels are available across the organization, with five channels that each have an independent toggle. **Ef..." |
*
* @param {Demo_Narrative_Admin_Channel_Policy_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_channel_policy_body = /** @type {((inputs?: Demo_Narrative_Admin_Channel_Policy_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Channel_Policy_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_channel_policy_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_channel_policy_body(inputs)
	return en_demo_narrative_admin_channel_policy_body(inputs)
});