/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Role_Permissions_BodyInputs */

const en_demo_narrative_admin_role_permissions_body = /** @type {(inputs: Demo_Narrative_Admin_Role_Permissions_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The permission matrix on the people page shows which capabilities each role grants, with permissions arranged in a grid grouped by level.
**Permission levels.** The three sections are volunteer, manager, and administrator. Volunteer and manager are default names the organization can rename in terminology settings, while administrator is fixed. Volunteer level capabilities are included in every role by default, manager level capabilities are added for manager and admin roles, and administrator capabilities belong to the admin role only. The intake response viewing permission sits in the administrator section with a row level warning because it grants decryption of intake responses across all queues, unlike other permissions that gate screens and actions.
**Toggling.** Tapping a cell toggles that permission for that role, and the change takes effect immediately for every user holding the role. Built in permissions that are essential to a role's level are locked and cannot be removed.
**What permissions control.** Each permission maps to specific actions in the app. Removing a permission from a role prevents every user in that role from performing the corresponding action.`)
};

const es_demo_narrative_admin_role_permissions_body = /** @type {(inputs: Demo_Narrative_Admin_Role_Permissions_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La matriz de permisos en la página de personas muestra qué capacidades otorga cada rol, con los permisos organizados en una cuadrícula agrupados por nivel.
**Niveles de permiso.** Las tres secciones son voluntario, gestor y administrador. Voluntario y gestor son nombres predeterminados que la organización puede renombrar en la configuración de terminología, mientras que administrador es fijo. Las capacidades de nivel voluntario se incluyen en todos los roles por defecto, las de nivel gestor se añaden para los roles de gestor y administrador, y las de administrador pertenecen solo al rol de administrador. El permiso de visualización de respuestas de admisión aparece en la sección de administrador con una advertencia a nivel de fila porque otorga descifrado de respuestas de admisión en todas las colas, a diferencia de los demás permisos que controlan pantallas y acciones.
**Activar y desactivar.** Tocar una celda activa o desactiva ese permiso para ese rol, y el cambio surte efecto inmediatamente para todos los usuarios con ese rol. Los permisos integrados esenciales para el nivel del rol están bloqueados y no se pueden eliminar.
**Qué controlan los permisos.** Cada permiso corresponde a acciones específicas en la aplicación, y eliminar un permiso de un rol impide que todos los usuarios de ese rol realicen la acción correspondiente.`)
};

/**
* | output |
* | --- |
* | "The permission matrix on the people page shows which capabilities each role grants, with permissions arranged in a grid grouped by level. **Permission levels..." |
*
* @param {Demo_Narrative_Admin_Role_Permissions_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_role_permissions_body = /** @type {((inputs?: Demo_Narrative_Admin_Role_Permissions_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Role_Permissions_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_role_permissions_body(inputs)
	return en_demo_narrative_admin_role_permissions_body(inputs)
});