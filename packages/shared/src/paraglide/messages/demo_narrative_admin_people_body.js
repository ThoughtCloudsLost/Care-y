/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_People_BodyInputs */

const en_demo_narrative_admin_people_body = /** @type {(inputs: Demo_Narrative_Admin_People_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The roster shows every volunteer in the organization with their role and assigned queues.
**Role management.** Each volunteer has one of three roles: Volunteer, Manager, or Admin, these role names can be changed per-org in the admin settings. The role determines which features and data are accessible.
**Invitations.** Administrators invite new volunteers either by generating an invite link to share or by creating the account manually. A pending invitation can be revoked before it is accepted. The invited volunteer completes onboarding and key generation on their own device.`)
};

const es_demo_narrative_admin_people_body = /** @type {(inputs: Demo_Narrative_Admin_People_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El directorio muestra cada voluntario de la organización con su rol y colas asignadas.
**Gestión de roles.** Cada voluntario tiene uno de tres roles: Voluntario, Gestor o Administrador, estos nombres de rol se pueden cambiar por organización en la configuración de administración. El rol determina qué funciones y datos son accesibles.
**Invitaciones.** Los administradores invitan a nuevos voluntarios generando un enlace de invitación para compartir o creando la cuenta manualmente. Una invitación pendiente puede revocarse antes de ser aceptada. El voluntario invitado completa la incorporación y la generación de claves en su propio dispositivo.`)
};

/**
* | output |
* | --- |
* | "The roster shows every volunteer in the organization with their role and assigned queues. **Role management.** Each volunteer has one of three roles: Volunte..." |
*
* @param {Demo_Narrative_Admin_People_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_people_body = /** @type {((inputs?: Demo_Narrative_Admin_People_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_People_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_admin_people_body(inputs)
	return es_demo_narrative_admin_people_body(inputs)
});