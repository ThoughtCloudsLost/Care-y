/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_People_BodyInputs */

const en_demo_narrative_admin_people_body = /** @type {(inputs: Demo_Narrative_Admin_People_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The roster shows every user in the organization with their role and assigned queues.
**Role management.** Each user holds one of three roles. The first two role names are defaults the organization can rename in terminology settings, while the administrator name is fixed. The role determines which permissions are granted by default, and those defaults are adjustable per role in the permission matrix.
**Invitations.** New users are invited either by generating an invite link or by creating the account manually, and a pending invitation can be revoked before it is accepted. The invited person completes onboarding and key generation on their own device.
**Permissions.** Viewing and managing the roster requires the Manage users permission.`)
};

const es_demo_narrative_admin_people_body = /** @type {(inputs: Demo_Narrative_Admin_People_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El directorio muestra a cada persona usuaria de la organización con su rol y colas asignadas.
**Gestión de roles.** Cada persona usuaria tiene uno de tres roles. Los dos primeros nombres de rol son predeterminados que la organización puede renombrar en la configuración de terminología, mientras que el de administrador es fijo. El rol determina qué permisos se otorgan por defecto, y esos valores predeterminados se pueden ajustar por rol en la matriz de permisos.
**Invitaciones.** Se invita a nuevas personas generando un enlace de invitación o creando la cuenta manualmente, y una invitación pendiente puede revocarse antes de ser aceptada. La persona invitada completa la incorporación y la generación de claves en su propio dispositivo.
**Permisos.** Ver y gestionar el directorio requiere el permiso Gestionar usuarios.`)
};

/**
* | output |
* | --- |
* | "The roster shows every user in the organization with their role and assigned queues. **Role management.** Each user holds one of three roles. The first two r..." |
*
* @param {Demo_Narrative_Admin_People_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_people_body = /** @type {((inputs?: Demo_Narrative_Admin_People_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_People_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_people_body(inputs)
	return en_demo_narrative_admin_people_body(inputs)
});